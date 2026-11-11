import express from 'express';
import { getTenantInfo, inviteMember } from '../controllers/tenantController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/info', getTenantInfo);
router.post('/invite', requireAdmin, inviteMember);

export default router;
