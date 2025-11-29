import express from 'express';
import {
  get2FAStatusController,
  generate2FASecretController,
  enable2FAController,
  disable2FAController,
  validate2FAToken
} from '../controllers/twoFactorController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * Two-factor authentication routes
 * All routes require authentication
 */
router.get('/status', authenticate, get2FAStatusController);
router.get('/generate', authenticate, generate2FASecretController);
router.post('/enable', authenticate, validate2FAToken, enable2FAController);
router.post('/disable', authenticate, disable2FAController);

export default router;

