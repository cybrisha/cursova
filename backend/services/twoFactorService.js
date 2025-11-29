import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import TwoFactorConfig from '../models/TwoFactorConfig.js';
import { createLogEntry } from './logService.js';

/**
 * Generate 2FA secret and QR code
 */
export const generate2FASecret = async (userId, userLogin) => {
  const secret = speakeasy.generateSecret({
    name: `Auth System (${userLogin})`,
    issuer: 'Critical Infrastructure Auth'
  });

  // Save or update 2FA config
  const [config, created] = await TwoFactorConfig.findOrCreate({
    where: { userId },
    defaults: {
      userId,
      secret: secret.base32,
      enabled: false
    }
  });

  if (!created) {
    config.secret = secret.base32;
    config.enabled = false;
    await config.save();
  }

  // Generate QR code
  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32
  };
};

/**
 * Verify 2FA token (for enabled 2FA)
 */
export const verify2FAToken = async (userId, token) => {
  const config = await TwoFactorConfig.findOne({ where: { userId } });

  if (!config || !config.enabled) {
    throw new Error('2FA not enabled for this user');
  }

  const verified = speakeasy.totp.verify({
    secret: config.secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after
  });

  return verified;
};

/**
 * Verify 2FA token during setup (before enabling)
 */
export const verify2FATokenForSetup = async (userId, token) => {
  const config = await TwoFactorConfig.findOne({ where: { userId } });

  if (!config) {
    throw new Error('2FA not configured. Please generate a secret first.');
  }

  if (!config.secret) {
    throw new Error('2FA secret not found. Please generate a secret first.');
  }

  const verified = speakeasy.totp.verify({
    secret: config.secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time steps before/after
  });

  return verified;
};

/**
 * Enable 2FA for user
 */
export const enable2FA = async (userId, token) => {
  const config = await TwoFactorConfig.findOne({ where: { userId } });

  if (!config) {
    throw new Error('2FA not configured');
  }

  // Verify token before enabling (using setup verification)
  const isValid = await verify2FATokenForSetup(userId, token);
  if (!isValid) {
    throw new Error('Invalid 2FA token');
  }

  config.enabled = true;
  await config.save();

  await createLogEntry({
    userId,
    actionType: 'user_updated',
    details: { action: '2FA enabled' }
  });

  return config;
};

/**
 * Get 2FA status for user
 */
export const get2FAStatus = async (userId) => {
  const config = await TwoFactorConfig.findOne({ where: { userId } });

  return {
    enabled: config ? config.enabled : false,
    configured: !!config
  };
};

/**
 * Disable 2FA for user
 */
export const disable2FA = async (userId) => {
  const config = await TwoFactorConfig.findOne({ where: { userId } });

  if (!config) {
    throw new Error('2FA not configured');
  }

  config.enabled = false;
  await config.save();

  await createLogEntry({
    userId,
    actionType: 'user_updated',
    details: { action: '2FA disabled' }
  });

  return config;
};

