import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import LogEntry from '../models/LogEntry.js';
import TwoFactorConfig from '../models/TwoFactorConfig.js';
import { createLogEntry } from './logService.js';
import { verify2FAToken } from './twoFactorService.js';

/**
 * Generate JWT access token
 */
export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
      login: user.login
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
    }
  );
};

/**
 * Generate JWT refresh token
 */
export const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      type: 'refresh'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Verify refresh token
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid refresh token');
  }
};

/**
 * Login service
 */
export const login = async (login, password, ipAddress, userAgent) => {
  // Find user by login
  const user = await User.findOne({ where: { login } });

  if (!user) {
    // Log failed attempt
    await createLogEntry({
      userId: null,
      actionType: 'login_failed',
      ipAddress,
      userAgent,
      details: { login, reason: 'User not found' }
    });
    throw new Error('Invalid credentials');
  }

  // Check if account is locked
  if (user.isLocked()) {
    await createLogEntry({
      userId: user.id,
      actionType: 'login_failed',
      ipAddress,
      userAgent,
      details: { login, reason: 'Account locked' }
    });
    throw new Error('Account is temporarily locked due to too many failed attempts');
  }

  // Check if account is blocked
  if (user.status === 'blocked') {
    await createLogEntry({
      userId: user.id,
      actionType: 'login_failed',
      ipAddress,
      userAgent,
      details: { login, reason: 'Account blocked' }
    });
    throw new Error('Account is blocked');
  }

  // Verify password
  const isValidPassword = await user.verifyPassword(password);

  if (!isValidPassword) {
    // Increment failed attempts
    await user.incrementFailedAttempts();
    
    await createLogEntry({
      userId: user.id,
      actionType: 'login_failed',
      ipAddress,
      userAgent,
      details: { login, reason: 'Invalid password' }
    });
    throw new Error('Invalid credentials');
  }

  // Reset failed attempts on successful password verification
  await user.resetFailedAttempts();

  // Check if 2FA is enabled for this user
  const twoFactorConfig = await TwoFactorConfig.findOne({ where: { userId: user.id } });
  const is2FAEnabled = twoFactorConfig && twoFactorConfig.enabled;

  if (is2FAEnabled) {
    // Generate temporary token for 2FA verification (5 minutes expiry)
    const tempToken = jwt.sign(
      {
        userId: user.id,
        type: '2fa_pending',
        login: user.login
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '5m'
      }
    );

    return {
      requires2FA: true,
      tempToken,
      user: {
        id: user.id,
        login: user.login,
        name: user.name,
        role: user.role,
        email: user.email
      }
    };
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate tokens (no 2FA required)
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Log successful login
  await createLogEntry({
    userId: user.id,
    actionType: 'login',
    ipAddress,
    userAgent,
    details: { login }
  });

  return {
    requires2FA: false,
    user: {
      id: user.id,
      login: user.login,
      name: user.name,
      role: user.role,
      email: user.email
    },
    accessToken,
    refreshToken
  };
};

/**
 * Refresh access token
 */
export const refreshAccessToken = async (refreshToken) => {
  const decoded = verifyRefreshToken(refreshToken);
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  const user = await User.findByPk(decoded.userId);

  if (!user || user.status !== 'active') {
    throw new Error('User not found or inactive');
  }

  return generateAccessToken(user);
};

/**
 * Verify 2FA and complete login
 */
export const verify2FALogin = async (tempToken, token, ipAddress, userAgent) => {
  // Verify temporary token
  let decoded;
  try {
    decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    if (decoded.type !== '2fa_pending') {
      throw new Error('Invalid token type');
    }
  } catch (error) {
    throw new Error('Invalid or expired temporary token');
  }

  // Find user
  const user = await User.findByPk(decoded.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Check if account is locked or blocked
  if (user.isLocked()) {
    throw new Error('Account is temporarily locked due to too many failed attempts');
  }

  if (user.status === 'blocked') {
    throw new Error('Account is blocked');
  }

  // Verify 2FA token
  const isValid2FA = await verify2FAToken(user.id, token);
  if (!isValid2FA) {
    // Log failed 2FA attempt
    await createLogEntry({
      userId: user.id,
      actionType: 'login_failed',
      ipAddress,
      userAgent,
      details: { login: user.login, reason: 'Invalid 2FA token' }
    });
    throw new Error('Invalid 2FA token');
  }

  // Update last login
  user.lastLoginAt = new Date();
  await user.save();

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Log successful login
  await createLogEntry({
    userId: user.id,
    actionType: 'login',
    ipAddress,
    userAgent,
    details: { login: user.login }
  });

  return {
    user: {
      id: user.id,
      login: user.login,
      name: user.name,
      role: user.role,
      email: user.email
    },
    accessToken,
    refreshToken
  };
};

/**
 * Logout service
 */
export const logout = async (userId, ipAddress, userAgent) => {
  await createLogEntry({
    userId,
    actionType: 'logout',
    ipAddress,
    userAgent,
    details: {}
  });
};

