import express from 'express';
import { getLogsController } from '../controllers/logController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * Log routes
 * Admin only
 */
router.get('/', authenticate, authorize('admin'), getLogsController);

export default router;

