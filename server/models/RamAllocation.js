import mongoose from 'mongoose';
import createMockModel from './dbAdapter.js';

const ramAllocationSchema = new mongoose.Schema({
  resourceId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  allocatedGb: { type: Number, required: true, min: 1, max: 256 },
  usedGb: { type: Number, required: true, default: 0 },
  workloadBinding: { type: String, required: true, default: 'Primary App Server' },
  memoryType: { type: String, default: 'DDR5 ECC Server Memory' },
  status: { type: String, default: 'Active' },
}, { timestamps: true });

const MongooseRamAllocation = mongoose.models.RamAllocation || mongoose.model('RamAllocation', ramAllocationSchema);
export default createMockModel('ramAllocations', MongooseRamAllocation);
