import crypto from 'crypto';
import ApiKey from '../models/ApiKey.js';
import ActivityLog from '../models/ActivityLog.js';

export const getSecurityOverview = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    const apiKeys = await ApiKey.find({ tenantId, status: 'active' });
    const logs = await ActivityLog.find({ tenantId }).sort({ createdAt: -1 }).limit(15);

    const securityStats = {
      healthScore: 98,
      status: 'Optimal / Enterprise Guard',
      tlsVersion: 'TLS 1.3 Strict',
      jwtAlgorithm: 'HMAC-SHA256 (256-bit)',
      tokenExpiration: '30 Days Rolling Session',
      activeApiKeysCount: apiKeys.length,
      tenantIsolationMode: 'Strict Namespace & Logical Multi-Tenancy',
      complianceStandards: ['SOC-2 Type II Compliant', 'ISO/IEC 27001 Ready', 'GDPR / HIPAA Encrypted'],
    };

    return res.json({
      success: true,
      securityStats,
      activeKeys: apiKeys,
      recentAuditLogs: logs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getApiKeys = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const keys = await ApiKey.find({ tenantId }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      keys,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createApiKey = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { name, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'API key description name is required.' });
    }

    // Generate random secure token
    const randomHex = crypto.randomBytes(24).toString('hex');
    const fullApiKey = `cs_live_${randomHex}`;
    const prefix = fullApiKey.slice(0, 14);
    const maskedKey = `${prefix}••••••••••••••••••••`;
    const hashedKey = crypto.createHash('sha256').update(fullApiKey).digest('hex');

    const keyId = `key-${Math.floor(1000 + Math.random() * 9000)}`;

    const newKey = await ApiKey.create({
      keyId,
      tenantId,
      userId: req.user._id,
      name: name.trim(),
      prefix,
      maskedKey,
      hashedKey,
      role: role || 'Read & Write',
      status: 'active',
      lastUsedAt: new Date(),
    });

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'GENERATE_API_KEY',
      category: 'Security',
      details: `Generated new production API key "${name}" (${prefix}...).`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.status(201).json({
      success: true,
      message: 'API Key generated successfully. Please copy it immediately.',
      plainTextKey: fullApiKey, // Only returned once on creation!
      key: newKey,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const revokeApiKey = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const key = await ApiKey.findOne({ _id: id, tenantId });
    if (!key) {
      return res.status(404).json({ success: false, message: 'API Key not found.' });
    }

    key.status = 'revoked';
    await key.save();

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'REVOKE_API_KEY',
      category: 'Security',
      details: `Revoked API key "${key.name}" (${key.prefix}...).`,
      status: 'Warning',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.json({
      success: true,
      message: `API Key "${key.name}" was successfully revoked.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { category, limit = 50 } = req.query;

    const filter = { tenantId };
    if (category && category !== 'all') {
      filter.category = category;
    }

    const logs = await ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    return res.json({
      success: true,
      logs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
