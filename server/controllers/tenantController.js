import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import CpuAllocation from '../models/CpuAllocation.js';
import RamAllocation from '../models/RamAllocation.js';
import CloudDatabase from '../models/CloudDatabase.js';
import StorageFile from '../models/StorageFile.js';
import bcrypt from 'bcryptjs';

export const getTenantInfo = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const tenant = await Tenant.findOne({ tenantId });
    if (!tenant) {
      return res.status(404).json({ success: false, message: 'Tenant record not found.' });
    }

    const members = await User.find({ tenantId }).select('-password').sort({ createdAt: -1 });

    const cpuAllocations = await CpuAllocation.find({ tenantId });
    const ramAllocations = await RamAllocation.find({ tenantId });
    const databases = await CloudDatabase.find({ tenantId });
    const files = await StorageFile.find({ tenantId });

    const totalCores = cpuAllocations.reduce((sum, item) => sum + item.cores, 0);
    const totalRamGb = ramAllocations.reduce((sum, item) => sum + item.allocatedGb, 0);
    const totalFileBytes = files.reduce((sum, item) => sum + item.sizeBytes, 0);
    const usedStorageGb = Number((totalFileBytes / (1024 * 1024 * 1024)).toFixed(3));

    return res.json({
      success: true,
      data: {
        tenant,
        members,
        quotaUsage: {
          cpu: { used: totalCores, max: tenant.maxCpuCores, percent: Number(((totalCores / tenant.maxCpuCores) * 100).toFixed(1)) },
          ram: { used: totalRamGb, max: tenant.maxRamGb, percent: Number(((totalRamGb / tenant.maxRamGb) * 100).toFixed(1)) },
          storage: { used: usedStorageGb, max: tenant.maxStorageGb, percent: Number(((usedStorageGb / tenant.maxStorageGb) * 100).toFixed(1)) },
          databases: { used: databases.length, max: tenant.maxDatabases, percent: Number(((databases.length / tenant.maxDatabases) * 100).toFixed(1)) },
        },
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, email, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User with this email already exists.' });
    }

    const tenant = await Tenant.findOne({ tenantId });
    const salt = await bcrypt.genSalt(10);
    const defaultPassword = password || 'CloudSphere@2026';
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'engineer',
      tenantId,
      tenantName: tenant?.name || 'Workspace',
    });

    return res.status(201).json({
      success: true,
      message: `Team member ${name} invited successfully.`,
      member: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        tenantId: newUser.tenantId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
