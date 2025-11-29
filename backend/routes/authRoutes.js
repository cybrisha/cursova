import express from 'express';
import {
  loginController,
  refreshTokenController,
  logoutController,
  getCurrentUserController,
  verify2FALoginController,
  validateLogin,
  validate2FALogin
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { loginRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Authentication routes
 */
router.post('/login', loginRateLimiter, validateLogin, loginController);
router.post('/verify-2fa', loginRateLimiter, validate2FALogin, verify2FALoginController);
router.post('/refresh', refreshTokenController);
router.post('/logout', authenticate, logoutController);
router.get('/me', authenticate, getCurrentUserController);

export default router;

