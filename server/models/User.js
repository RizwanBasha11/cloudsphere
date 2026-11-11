import mongoose from 'mongoose';
import createMockModel from './dbAdapter.js';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'tenant', 'engineer'], default: 'tenant' },
  tenantId: { type: String, required: true, index: true },
  tenantName: { type: String, default: 'CloudSphere Tenant Org' },
  avatar: { type: String, default: '' },
}, { timestamps: true });

const MongooseUser = mongoose.models.User || mongoose.model('User', userSchema);
export default createMockModel('users', MongooseUser);
