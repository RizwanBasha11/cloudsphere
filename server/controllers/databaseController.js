import CloudDatabase from '../models/CloudDatabase.js';
import Tenant from '../models/Tenant.js';
import ActivityLog from '../models/ActivityLog.js';

export const getDatabases = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { search, engine } = req.query;

    const query = { tenantId };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (engine && engine !== 'all') {
      query.engine = engine;
    }

    const databases = await CloudDatabase.find(query).sort({ createdAt: -1 });

    const totalDatabases = databases.length;
    const activeDatabases = databases.filter(d => d.status === 'Active').length;
    const totalStorageMb = databases.reduce((sum, d) => sum + (d.storageMb || 0), 0);

    return res.json({
      success: true,
      data: {
        totalDatabases,
        activeDatabases,
        totalStorageMb,
        databases,
      },
    });
  } catch (error) {
    console.error('[DatabaseController.getDatabases] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createDatabase = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, engine, storageMb, version } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Database name is required.' });
    }

    // Engine validation
    const validEngines = ['PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Cassandra'];
    const chosenEngine = validEngines.includes(engine) ? engine : 'PostgreSQL';

    // Tenant limit check
    const tenant = await Tenant.findOne({ tenantId });
    const maxDb = tenant?.maxDatabases || 20;

    const existingCount = await CloudDatabase.countDocuments({ tenantId });
    if (existingCount >= maxDb) {
      return res.status(400).json({
        success: false,
        message: `Database limit reached for tier. Maximum allowed: ${maxDb} databases.`,
      });
    }

    // Name uniqueness check within tenant
    const sanitizedName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-');
    const existing = await CloudDatabase.findOne({ tenantId, name: sanitizedName });
    if (existing) {
      return res.status(400).json({ success: false, message: `Database "${sanitizedName}" already exists in your workspace.` });
    }

    const defaultPorts = {
      'PostgreSQL': 5432,
      'MongoDB': 27017,
      'MySQL': 3306,
      'Redis': 6379,
      'Cassandra': 9042,
    };

    const databaseId = `db-${Math.floor(1000 + Math.random() * 9000)}`;
    const port = defaultPorts[chosenEngine] || 5432;
    const connectionHost = `${chosenEngine.toLowerCase()}-${sanitizedName}.${tenantId}.cloudsphere.internal`;

    const newDb = await CloudDatabase.create({
      databaseId,
      tenantId,
      userId: req.user._id,
      name: sanitizedName,
      engine: chosenEngine,
      version: version || '16.2 LTS',
      status: 'Active',
      storageMb: parseInt(storageMb, 10) || 1024,
      connectionHost,
      port,
      iops: 3000,
    });

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'PROVISION_DATABASE',
      category: 'Database',
      details: `Provisioned managed ${chosenEngine} database instance "${sanitizedName}" (${databaseId}).`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.status(201).json({
      success: true,
      message: `Database instance "${sanitizedName}" provisioned successfully.`,
      database: newDb,
    });
  } catch (error) {
    console.error('[DatabaseController.createDatabase] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getDatabaseDetails = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const database = await CloudDatabase.findOne({ _id: id, tenantId });
    if (!database) {
      return res.status(404).json({ success: false, message: 'Database instance not found.' });
    }

    // Connection string preview
    const connMap = {
      'PostgreSQL': `postgresql://app_user:••••••••@${database.connectionHost}:${database.port}/${database.name}?sslmode=require`,
      'MongoDB': `mongodb+srv://admin:••••••••@${database.connectionHost}/${database.name}?retryWrites=true&w=majority`,
      'MySQL': `mysql://admin:••••••••@${database.connectionHost}:${database.port}/${database.name}`,
      'Redis': `rediss://default:••••••••@${database.connectionHost}:${database.port}`,
      'Cassandra': `cqlsh://${database.connectionHost}:${database.port}`,
    };

    return res.json({
      success: true,
      database: {
        ...database.toObject(),
        connectionStringPreview: connMap[database.engine] || `tcp://${database.connectionHost}:${database.port}`,
        healthStatus: 'Optimal (99.99% SLA)',
        replicationLagMs: '1.2ms',
        activeConnections: Math.floor(12 + Math.random() * 20),
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDatabase = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const database = await CloudDatabase.findOneAndDelete({ _id: id, tenantId });
    if (!database) {
      return res.status(404).json({ success: false, message: 'Database instance not found or already deleted.' });
    }

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'DELETE_DATABASE',
      category: 'Database',
      details: `Terminated and deleted managed database instance "${database.name}" (${database.databaseId}).`,
      status: 'Warning',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.json({
      success: true,
      message: `Database "${database.name}" was successfully decommissioned and deleted.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
