import express from 'express';
import { getCpuSummary, allocateCpu, updateCpuAllocation, releaseCpuAllocation } from '../controllers/computeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All compute routes are protected and tenant isolated

router.get('/summary', getCpuSummary);
router.post('/allocate', allocateCpu);
router.put('/:id', updateCpuAllocation);
router.delete('/:id', releaseCpuAllocation);

export default router;
