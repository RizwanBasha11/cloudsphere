import express from 'express';
import { getDatabases, createDatabase, getDatabaseDetails, deleteDatabase } from '../controllers/databaseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // Tenant-isolated protected routes

router.get('/', getDatabases);
router.post('/create', createDatabase);
router.get('/:id', getDatabaseDetails);
router.delete('/:id', deleteDatabase);

export default router;
