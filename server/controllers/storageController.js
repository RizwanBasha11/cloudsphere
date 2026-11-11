import fs from 'fs';
import path from 'path';
import StorageFile from '../models/StorageFile.js';
import Tenant from '../models/Tenant.js';
import ActivityLog from '../models/ActivityLog.js';

export const getStorageSummary = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const tenant = await Tenant.findOne({ tenantId });
    const maxStorageGb = tenant?.maxStorageGb || 500;

    const files = await StorageFile.find({ tenantId }).sort({ createdAt: -1 });

    const totalBytesUsed = files.reduce((acc, f) => acc + (f.sizeBytes || 0), 0);
    const usedStorageGb = Number((totalBytesUsed / (1024 * 1024 * 1024)).toFixed(3));
    const availableStorageGb = Math.max(0, Number((maxStorageGb - usedStorageGb).toFixed(3)));
    const utilizationPercentage = Number(((usedStorageGb / maxStorageGb) * 100).toFixed(2));

    // Categorize files
    const categoryBreakdown = {
      documents: 0,
      images: 0,
      archives: 0,
      data: 0,
      others: 0,
    };

    files.forEach(f => {
      const type = (f.fileType || '').toLowerCase();
      const ext = path.extname(f.originalName || '').toLowerCase();
      if (type.includes('image') || ['.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(ext)) {
        categoryBreakdown.images += f.sizeBytes;
      } else if (type.includes('pdf') || type.includes('word') || type.includes('text') || ['.pdf', '.doc', '.docx', '.txt', '.md'].includes(ext)) {
        categoryBreakdown.documents += f.sizeBytes;
      } else if (type.includes('zip') || type.includes('tar') || type.includes('gzip') || ['.zip', '.tar', '.gz', '.7z'].includes(ext)) {
        categoryBreakdown.archives += f.sizeBytes;
      } else if (type.includes('json') || type.includes('csv') || type.includes('xml') || ['.json', '.csv', '.sql'].includes(ext)) {
        categoryBreakdown.data += f.sizeBytes;
      } else {
        categoryBreakdown.others += f.sizeBytes;
      }
    });

    return res.json({
      success: true,
      data: {
        totalCapacityGb: maxStorageGb,
        usedStorageGb,
        availableStorageGb,
        utilizationPercentage,
        totalFilesCount: files.length,
        totalBytesUsed,
        categoryBreakdown,
        files,
      },
    });
  } catch (error) {
    console.error('[StorageController.getStorageSummary] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const uploadFile = async (req, res) => {
  try {
    const tenantId = req.tenantId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please attach a valid file to upload.' });
    }

    const { filename, originalname, mimetype, size, path: filePath } = req.file;

    // Check storage limits
    const tenant = await Tenant.findOne({ tenantId });
    const maxStorageBytes = (tenant?.maxStorageGb || 500) * 1024 * 1024 * 1024;

    const existingFiles = await StorageFile.find({ tenantId });
    const currentBytes = existingFiles.reduce((sum, f) => sum + (f.sizeBytes || 0), 0);

    if (currentBytes + size > maxStorageBytes) {
      // Remove the uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: 'Storage quota exceeded. Please upgrade your storage tier or delete older files.',
      });
    }

    const fileId = `obj-${Math.floor(10000 + Math.random() * 90000)}`;

    const newFile = await StorageFile.create({
      fileId,
      tenantId,
      userId: req.user._id,
      fileName: filename,
      originalName: originalname,
      fileType: mimetype || 'application/octet-stream',
      sizeBytes: size,
      filePath: filePath,
      bucket: `${tenantId}-bucket`,
    });

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'UPLOAD_FILE',
      category: 'Storage',
      details: `Uploaded file "${originalname}" (${(size / (1024 * 1024)).toFixed(2)} MB) to tenant storage.`,
      status: 'Success',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.status(201).json({
      success: true,
      message: `File "${originalname}" uploaded successfully.`,
      file: newFile,
    });
  } catch (error) {
    console.error('[StorageController.uploadFile] Error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const downloadFile = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const fileDoc = await StorageFile.findOne({ _id: id, tenantId });
    if (!fileDoc) {
      return res.status(404).json({ success: false, message: 'File not found or permission denied.' });
    }

    if (!fs.existsSync(fileDoc.filePath)) {
      return res.status(404).json({ success: false, message: 'File binary does not exist on disk.' });
    }

    return res.download(fileDoc.filePath, fileDoc.originalName);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const tenantId = req.tenantId;
    const { id } = req.params;

    const fileDoc = await StorageFile.findOne({ _id: id, tenantId });
    if (!fileDoc) {
      return res.status(404).json({ success: false, message: 'File not found or already removed.' });
    }

    // Unlink physical file if exists
    if (fs.existsSync(fileDoc.filePath)) {
      try {
        fs.unlinkSync(fileDoc.filePath);
      } catch (err) {
        console.warn(`[StorageController] Could not unlink ${fileDoc.filePath}:`, err.message);
      }
    }

    await StorageFile.deleteOne({ _id: id, tenantId });

    await ActivityLog.create({
      tenantId,
      userId: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: 'DELETE_FILE',
      category: 'Storage',
      details: `Purged storage object "${fileDoc.originalName}" (${fileDoc.fileId}).`,
      status: 'Warning',
      ipAddress: req.ip || '127.0.0.1',
    });

    return res.json({
      success: true,
      message: `File "${fileDoc.originalName}" was permanently removed.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
