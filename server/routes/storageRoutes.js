import express from 'express';
import { getStorageSummary, uploadFile, downloadFile, deleteFile } from '../controllers/storageController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // Tenant-isolated protected routes

router.get('/summary', getStorageSummary);
router.post('/upload', upload.single('file'), uploadFile);
router.get('/download/:id', downloadFile);
router.delete('/:id', deleteFile);

export default router;
