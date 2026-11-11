import mongoose from 'mongoose';
import createMockModel from './dbAdapter.js';

const cpuAllocationSchema = new mongoose.Schema({
  resourceId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cores: { type: Number, required: true, min: 1, max: 64 },
  workloadType: { type: String, required: true, default: 'Microservices Node' },
  status: { type: String, default: 'Active' },
  utilization: { type: Number, default: 45.0 },
  instanceType: { type: String, default: 'c6g.xlarge' },
  notes: { type: String, default: 'Standard auto-balanced container worker pool' },
}, { timestamps: true });

const MongooseCpuAllocation = mongoose.models.CpuAllocation || mongoose.model('CpuAllocation', cpuAllocationSchema);
export default createMockModel('cpuAllocations', MongooseCpuAllocation);
