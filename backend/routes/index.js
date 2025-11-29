import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import logRoutes from './logRoutes.js';
import twoFactorRoutes from './twoFactorRoutes.js';

const router = express.Router();

/**
 * API routes
 */
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/logs', logRoutes);
router.use('/2fa', twoFactorRoutes);

export default router;

