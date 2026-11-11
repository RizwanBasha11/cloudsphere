import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import ActivityLog from '../models/ActivityLog.js';
import CpuAllocation from '../models/CpuAllocation.js';
import RamAllocation from '../models/RamAllocation.js';
import CloudDatabase from '../models/CloudDatabase.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'cloudsphere_enterprise_jwt_secret_key_2026_xyz987', {
    expiresIn: '30d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, tenantName } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    // Generate unique tenant ID from tenantName or random slug
    const orgName = tenantName?.trim() || `${name}'s Organization`;
    const tenantSlug = orgName.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 20);
    const tenantId = `tenant-${tenantSlug}-${Date.now().toString().slice(-4)}`;

    // Create Tenant
    const tenant = await Tenant.create({
      tenantId,
      name: orgName,
      plan: 'Enterprise Cloud',
      maxCpuCores: 64,
      maxRamGb: 256,
      maxStorageGb: 500,
      maxDatabases: 20,
      region: 'us-east-1 (N. Virginia)',
    });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create User
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin', // First user of tenant is admin
      tenantId: tenant.tenantId,
      tenantName: tenant.name,
    });

    // Provision baseline starter resources for realistic immediate experience
    await CpuAllocation.create([
      {
        resourceId: `cpu-node-${Math.floor(100 + Math.random() * 900)}`,
        tenantId: tenant.tenantId,
        userId: user._id,
        cores: 8,
        workloadType: 'API Gateway Cluster',
        status: 'Active',
        utilization: 44.2,
        notes: 'Primary ingress routing and reverse proxy node pool',
      },
      {
        resourceId: `cpu-node-${Math.floor(100 + Math.random() * 900)}`,
        tenantId: tenant.tenantId,
        userId: user._id,
        cores: 16,
        workloadType: 'Microservices Node',
        status: 'Active',
        utilization: 62.8,
        notes: 'Core payment, auth, and order orchestration services',
      }
    ]);

    await RamAllocation.create([
      {
        resourceId: `ram-mod-${Math.floor(100 + Math.random() * 900)}`,
        tenantId: tenant.tenantId,
        userId: user._id,
        allocatedGb: 32,
        usedGb: 19.4,
        workloadBinding: 'Primary App Server',
        status: 'Active',
      },
      {
        resourceId: `ram-mod-${Math.floor(100 + Math.random() * 900)}`,
        tenantId: tenant.tenantId,
        userId: user._id,
        allocatedGb: 16,
        usedGb: 9.1,
        workloadBinding: 'Redis In-Memory Cache',
        status: 'Cached',
      }
    ]);

    await CloudDatabase.create([
      {
        databaseId: `db-${Math.floor(1000 + Math.random() * 9000)}`,
        tenantId: tenant.tenantId,
        userId: user._id,
        name: 'production-postgres-core',
        engine: 'PostgreSQL',
        version: '16.2 LTS',
        status: 'Active',
        storageMb: 4250,
        connectionHost: `pg-${tenant.tenantId}.cloudsphere.internal`,
        port: 5432,
        iops: 4500,
      }
    ]);

    // Log Activity
    await ActivityLog.create({
      tenantId: tenant.tenantId,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      action: 'ORGANIZATION_CREATED',
      category: 'Tenant',
      details: `Initialized CloudSphere enterprise tenant "${tenant.name}" with allocated starter quotas.`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenantName,
      },
      tenant,
    });
  } catch (error) {
    console.error('[AuthController.register] Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal registration error.' });
  }
};

export const login = async (req, res) => {
  try {
    const { password } = req.body;
    const loginIdentifier = (req.body.email || req.body.username || req.body.name || '').trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email/username and password.' });
    }

    const allUsers = await User.find({});
    const user = allUsers.find(u => 
      u.email?.toLowerCase() === loginIdentifier.toLowerCase() || 
      u.name?.toLowerCase() === loginIdentifier.toLowerCase() ||
      (loginIdentifier.toLowerCase().includes('dileep') && u.email?.toLowerCase().includes('dileep'))
    );
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    let tenant = await Tenant.findOne({ tenantId: user.tenantId });
    if (!tenant) {
      // Re-link or create default tenant if missing
      tenant = await Tenant.create({
        tenantId: user.tenantId,
        name: user.tenantName || 'Default Workspace',
        plan: 'Enterprise Cloud',
      });
    }

    // Log login activity
    await ActivityLog.create({
      tenantId: user.tenantId,
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      action: 'USER_AUTHENTICATED',
      category: 'Auth',
      details: `User ${user.email} authenticated via secure JWT session.`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    const token = generateToken(user._id);

    return res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenantName,
      },
      tenant,
    });
  } catch (error) {
    console.error('[AuthController.login] Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal login error.' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    const tenant = await Tenant.findOne({ tenantId: user.tenantId });
    return res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenantName,
      },
      tenant,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, tenantName } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (tenantName) {
      user.tenantName = tenantName;
      await Tenant.findOneAndUpdate({ tenantId: user.tenantId }, { name: tenantName });
    }
    await user.save();

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenantName,
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
