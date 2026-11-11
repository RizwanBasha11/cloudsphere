import express from 'express';
import { getRamSummary, allocateRam, scaleRamAllocation, releaseRamAllocation } from '../controllers/memoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Tenant-isolated protected routes

router.get('/summary', getRamSummary);
router.post('/allocate', allocateRam);
router.put('/:id', scaleRamAllocation);
router.delete('/:id', releaseRamAllocation);

export default router;
