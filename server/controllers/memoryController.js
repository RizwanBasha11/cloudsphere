import RamAllocation from '../models/RamAllocation.js';
import Tenant from '../models/Tenant.js';
import ActivityLog from '../models/ActivityLog.js';

export const getRamSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const tenant = await Tenant.findOne({ tenantId });
    const maxRam = tenant?.maxRamGb || 256;

    const allocations = await RamAllocation.find({ tenantId }).sort({ createdAt: -1 });

    const totalAllocated = allocations.reduce((acc, curr) => acc + curr.allocatedGb, 0);
    const totalUsed = allocations.reduce((acc, curr) => acc + (curr.usedGb || 0), 0);
    const availableRam = Math.max(0, maxRam - totalAllocated);

    const utilizationPercentage = totalAllocated > 0
      ? Number(((totalUsed / totalAllocated) * 100).toFixed(1))
      : 0;

    return res.json({
      success: true,
      data: {
        totalRam: maxRam,
        allocatedRam: totalAllocated,
        usedRam: Number(totalUsed.toFixed(1)),
        availableRam,
        utilizationPercentage,
        activeModulesCount: allocations.length,
        allocations,
      },
    });
  } catch (error) {
    console.error('[MemoryController.getRamSummary] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const allocateRam = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { allocatedGb, workloadBinding } = req.body;

    const requestedGb = parseInt(allocatedGb, 10);
    if (!requestedGb || requestedGb < 1 || requestedGb > 256) {
      return res.status(400).json({ success: false, message: 'Please specify a valid RAM amount (1-256 GB).' });
    }

    const tenant = await Tenant.findOne({ tenantId });
    const maxRam = tenant?.maxRamGb || 256;

    const currentAllocations = await RamAllocation.find({ tenantId });
    const currentAllocated = currentAllocations.reduce((sum, item) => sum + item.allocatedGb, 0);

    // Limit validation
    if (currentAllocated + requestedGb > maxRam) {
      return res.status(400).json({
        success: false,
        message: `RAM allocation exceeded limit. Available: ${maxRam - currentAllocated} GB, Requested: ${requestedGb} GB.`,
      });
    }

    const resourceId = `ram-mod-${Math.floor(100 + Math.random() * 900)}`;
    const simulatedUsed = Number((requestedGb * (0.45 + Math.random() * 0.35)).toFixed(1));

    const newAllocation = await RamAllocation.create({
      resourceId,
      tenantId,
      userId: req.user._id,
      allocatedGb: requestedGb,
      usedGb: simulatedUsed,
      workloadBinding: workloadBinding || 'Primary App Server',
      status: 'Active',
    });

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'ALLOCATE_RAM',
      category: 'Memory',
      details: `Provisioned ${requestedGb} GB RAM block for [${newAllocation.workloadBinding}] (${resourceId}).`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.status(201).json({
      success: true,
      message: `Successfully provisioned ${requestedGb} GB RAM.`,
      allocation: newAllocation,
    });
  } catch (error) {
    console.error('[MemoryController.allocateRam] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const scaleRamAllocation = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { allocatedGb, workloadBinding } = req.body;

    const allocation = await RamAllocation.findOne({ _id: id, tenantId });
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'RAM module resource not found.' });
    }

    if (allocatedGb !== undefined) {
      const newGb = parseInt(allocatedGb, 10);
      if (newGb < 1 || newGb > 256) {
        return res.status(400).json({ success: false, message: 'Invalid RAM allocation range (1-256 GB).' });
      }

      const tenant = await Tenant.findOne({ tenantId });
      const maxRam = tenant?.maxRamGb || 256;

      const otherAllocations = await RamAllocation.find({ tenantId, _id: { $ne: id } });
      const otherTotal = otherAllocations.reduce((sum, item) => sum + item.allocatedGb, 0);

      if (otherTotal + newGb > maxRam) {
        return res.status(400).json({
          success: false,
          message: `Cannot scale memory. Exceeds quota: Max RAM: ${maxRam} GB, Required: ${otherTotal + newGb} GB.`,
        });
      }

      const diff = newGb - allocation.allocatedGb;
      allocation.allocatedGb = newGb;
      allocation.usedGb = Number((newGb * 0.6).toFixed(1));
      allocation.status = diff > 0 ? 'Balancing' : 'Active';

      await ActivityLog.create({
        tenantId,
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        action: 'SCALE_RAM',
        category: 'Memory',
        details: `Elastic scaling of ${allocation.resourceId}: adjusted memory from ${allocation.allocatedGb - diff} GB to ${newGb} GB.`,
        status: 'Success',
        ipAddress: req.ip || '127.0.0.1',
      });
    }

    if (workloadBinding) allocation.workloadBinding = workloadBinding;

    await allocation.save();

    return res.json({
      success: true,
      message: 'Memory allocation updated successfully.',
      allocation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const releaseRamAllocation = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const allocation = await RamAllocation.findOneAndDelete({ _id: id, tenantId });
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'RAM resource not found or already released.' });
    }

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'RELEASE_RAM',
      category: 'Memory',
      details: `Decommissioned memory resource ${allocation.resourceId} (${allocation.allocatedGb} GB returned to pool).`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.json({
      success: true,
      message: `Released RAM module ${allocation.resourceId}. ${allocation.allocatedGb} GB returned to available pool.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
