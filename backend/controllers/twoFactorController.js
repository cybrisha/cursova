import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import {
  generate2FASecret,
  verify2FAToken,
  enable2FA,
  disable2FA,
  get2FAStatus
} from '../services/twoFactorService.js';

/**
 * Validation rules for 2FA token
 */
export const validate2FAToken = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('2FA token must be 6 digits')
];

/**
 * Get 2FA status
 */
export const get2FAStatusController = async (req, res) => {
  try {
    const status = await get2FAStatus(req.user.id);
    res.json(status);
  } catch (error) {
    req.logger?.error('Get 2FA status error:', error);
    res.status(500).json({ 
      error: 'Failed to get 2FA status',
      message: error.message
    });
  }
};

/**
 * Generate 2FA secret and QR code
 */
export const generate2FASecretController = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const result = await generate2FASecret(req.user.id, user.login);

    res.json({
      message: '2FA secret generated',
      ...result
    });
  } catch (error) {
    req.logger?.error('Generate 2FA secret error:', error);
    res.status(500).json({ 
      error: 'Failed to generate 2FA secret',
      message: error.message
    });
  }
};

/**
 * Enable 2FA
 */
export const enable2FAController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.body;
    await enable2FA(req.user.id, token);

    res.json({ message: '2FA enabled successfully' });
  } catch (error) {
    req.logger?.error('Enable 2FA error:', error);
    res.status(400).json({ 
      error: 'Failed to enable 2FA',
      message: error.message
    });
  }
};

/**
 * Disable 2FA
 */
export const disable2FAController = async (req, res) => {
  try {
    await disable2FA(req.user.id);

    res.json({ message: '2FA disabled successfully' });
  } catch (error) {
    req.logger?.error('Disable 2FA error:', error);
    res.status(500).json({ 
      error: 'Failed to disable 2FA',
      message: error.message
    });
  }
};

