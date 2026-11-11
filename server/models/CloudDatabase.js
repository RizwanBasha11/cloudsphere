import mongoose from 'mongoose';
import createMockModel from './dbAdapter.js';

const cloudDatabaseSchema = new mongoose.Schema({
  databaseId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true, trim: true },
  engine: { type: String, required: true, default: 'PostgreSQL' },
  version: { type: String, default: '16.2 LTS' },
  status: { type: String, default: 'Active' },
  storageMb: { type: Number, required: true, default: 1024 },
  connectionHost: { type: String, default: 'cluster-0.east.cloudsphere.internal' },
  port: { type: Number, default: 5432 },
  iops: { type: Number, default: 3000 },
}, { timestamps: true });

const MongooseCloudDatabase = mongoose.models.CloudDatabase || mongoose.model('CloudDatabase', cloudDatabaseSchema);
export default createMockModel('cloudDatabases', MongooseCloudDatabase);
