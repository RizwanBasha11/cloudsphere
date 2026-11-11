import mongoose from 'mongoose';
import createMockModel from './dbAdapter.js';

const tenantSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  plan: { type: String, enum: ['Developer Sandbox', 'Growth Tier', 'Enterprise Cloud'], default: 'Enterprise Cloud' },
  maxCpuCores: { type: Number, default: 64 },
  maxRamGb: { type: Number, default: 256 },
  maxStorageGb: { type: Number, default: 500 },
  maxDatabases: { type: Number, default: 20 },
  region: { type: String, default: 'us-east-1 (N. Virginia)' },
  tierStatus: { type: String, default: 'Healthy / Active' },
}, { timestamps: true });

const MongooseTenant = mongoose.models.Tenant || mongoose.model('Tenant', tenantSchema);
export default createMockModel('tenants', MongooseTenant);
