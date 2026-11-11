import CpuAllocation from '../models/CpuAllocation.js';
import Tenant from '../models/Tenant.js';
import ActivityLog from '../models/ActivityLog.js';

export const getCpuSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const tenant = await Tenant.findOne({ tenantId });
    const maxCores = tenant?.maxCpuCores || 64;

    const allocations = await CpuAllocation.find({ tenantId }).sort({ createdAt: -1 });

    const totalAllocated = allocations.reduce((acc, curr) => acc + curr.cores, 0);
    const availableCores = Math.max(0, maxCores - totalAllocated);

    // Calculate weighted utilization percentage
    let utilization = 0;
    if (totalAllocated > 0) {
      const weightedSum = allocations.reduce((acc, curr) => acc + (curr.cores * (curr.utilization || 40)), 0);
      utilization = Number((weightedSum / totalAllocated).toFixed(1));
    }

    return res.json({
      success: true,
      data: {
        totalCores: maxCores,
        allocatedCores: totalAllocated,
        availableCores,
        utilizationPercentage: utilization,
        activeNodesCount: allocations.length,
        allocations,
      },
    });
  } catch (error) {
    console.error('[ComputeController.getCpuSummary] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const allocateCpu = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { cores, workloadType, notes } = req.body;

    const requestedCores = parseInt(cores, 10);
    if (!requestedCores || requestedCores < 1 || requestedCores > 64) {
      return res.status(400).json({ success: false, message: 'Please specify a valid number of CPU cores (1-64).' });
    }

    const tenant = await Tenant.findOne({ tenantId });
    const maxCores = tenant?.maxCpuCores || 64;

    const currentAllocations = await CpuAllocation.find({ tenantId });
    const currentAllocated = currentAllocations.reduce((sum, item) => sum + item.cores, 0);

    // Elasticity Validation: Check quota limits
    if (currentAllocated + requestedCores > maxCores) {
      return res.status(400).json({
        success: false,
        message: `Resource allocation denied. Quota exceeded: Available cores: ${maxCores - currentAllocated}, Requested: ${requestedCores}.`,
      });
    }

    const resourceId = `cpu-node-${Math.floor(100 + Math.random() * 900)}`;
    const randomUtil = Number((35 + Math.random() * 35).toFixed(1));

    const newAllocation = await CpuAllocation.create({
      resourceId,
      tenantId,
      userId: req.user._id,
      cores: requestedCores,
      workloadType: workloadType || 'Microservices Node',
      status: 'Active',
      utilization: randomUtil,
      notes: notes || `Dedicated ${requestedCores}-core elastic compute instance`,
    });

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'ALLOCATE_CPU',
      category: 'Compute',
      details: `Allocated ${requestedCores} CPU cores for workload [${newAllocation.workloadType}] (${resourceId}).`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.status(201).json({
      success: true,
      message: `Successfully provisioned ${requestedCores} CPU cores.`,
      allocation: newAllocation,
    });
  } catch (error) {
    console.error('[ComputeController.allocateCpu] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCpuAllocation = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;
    const { cores, workloadType, status } = req.body;

    const allocation = await CpuAllocation.findOne({ _id: id, tenantId });
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Compute allocation resource not found.' });
    }

    if (cores !== undefined) {
      const newCores = parseInt(cores, 10);
      if (newCores < 1 || newCores > 64) {
        return res.status(400).json({ success: false, message: 'Invalid core allocation amount (1-64).' });
      }

      // Check tenant quota when scaling up
      const tenant = await Tenant.findOne({ tenantId });
      const maxCores = tenant?.maxCpuCores || 64;

      const otherAllocations = await CpuAllocation.find({ tenantId, _id: { $ne: id } });
      const otherTotal = otherAllocations.reduce((sum, item) => sum + item.cores, 0);

      if (otherTotal + newCores > maxCores) {
        return res.status(400).json({
          success: false,
          message: `Cannot scale compute. Exceeds quota: Max cores: ${maxCores}, Required: ${otherTotal + newCores}.`,
        });
      }

      const diff = newCores - allocation.cores;
      const scaleAction = diff > 0 ? 'Scaled Up' : 'Scaled Down';
      
      allocation.cores = newCores;
      allocation.status = scaleAction;

      await ActivityLog.create({
        tenantId,
        userId: req.user._id,
        userName: req.user.name,
        userEmail: req.user.email,
        action: 'SCALE_CPU',
        category: 'Compute',
        details: `Elastic scaling of ${allocation.resourceId}: adjusted from ${allocation.cores - diff} to ${newCores} cores (${scaleAction}).`,
        status: 'Success',
        ipAddress: req.ip || '127.0.0.1',
      });
    }

    if (workloadType) allocation.workloadType = workloadType;
    if (status) allocation.status = status;

    await allocation.save();

    return res.json({
      success: true,
      message: 'Compute allocation updated successfully.',
      allocation,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const releaseCpuAllocation = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const allocation = await CpuAllocation.findOneAndDelete({ _id: id, tenantId });
    if (!allocation) {
      return res.status(404).json({ success: false, message: 'Compute resource not found or already released.' });
    }

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'RELEASE_CPU',
      category: 'Compute',
      details: `Released compute resource ${allocation.resourceId} (${allocation.cores} cores decommissioned).`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.json({
      success: true,
      message: `Released compute resource ${allocation.resourceId}. ${allocation.cores} cores returned to available pool.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
