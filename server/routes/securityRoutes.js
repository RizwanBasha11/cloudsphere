import express from 'express';
import { getSecurityOverview, getApiKeys, createApiKey, revokeApiKey, getAuditLogs } from '../controllers/securityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/overview', getSecurityOverview);
router.get('/keys', getApiKeys);
router.post('/keys', createApiKey);
router.delete('/keys/:id', revokeApiKey);
router.get('/audit-logs', getAuditLogs);

export default router;
