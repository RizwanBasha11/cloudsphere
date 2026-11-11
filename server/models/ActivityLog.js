import mongoose from 'mongoose';
import createMockModel from './dbAdapter.js';

const activityLogSchema = new mongoose.Schema({
  tenantId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, default: 'CloudSphere System' },
  userEmail: { type: String },
  action: { type: String, required: true },
  category: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, default: 'Success' },
  ipAddress: { type: String, default: '127.0.0.1' },
}, { timestamps: true });

const MongooseActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
export default createMockModel('activityLogs', MongooseActivityLog);
