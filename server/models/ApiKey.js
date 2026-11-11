import mongoose from 'mongoose';
import createMockModel from './dbAdapter.js';

const apiKeySchema = new mongoose.Schema({
  keyId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  prefix: { type: String, required: true },
  maskedKey: { type: String, required: true },
  hashedKey: { type: String, required: true },
  role: { type: String, default: 'Read & Write' },
  lastUsedAt: { type: Date },
  status: { type: String, default: 'active' },
}, { timestamps: true });

const MongooseApiKey = mongoose.models.ApiKey || mongoose.model('ApiKey', apiKeySchema);
export default createMockModel('apiKeys', MongooseApiKey);
