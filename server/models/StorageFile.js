import mongoose from 'mongoose';
import createMockModel from './dbAdapter.js';

const storageFileSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  tenantId: { type: String, required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: { type: String, required: true },
  originalName: { type: String, required: true },
  fileType: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  filePath: { type: String, required: true },
  bucket: { type: String, default: 'cloudsphere-tenant-vault' },
  checksum: { type: String, default: '' },
}, { timestamps: true });

const MongooseStorageFile = mongoose.models.StorageFile || mongoose.model('StorageFile', storageFileSchema);
export default createMockModel('storageFiles', MongooseStorageFile);
