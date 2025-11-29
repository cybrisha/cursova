import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (req, res, next) => {
  try {
    // Try to get token from httpOnly cookie first, then Authorization header
    let token = req.cookies?.accessToken || 
                req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await User.findByPk(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'User not found'
      });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ 
        error: 'Account blocked',
        message: 'Your account has been blocked'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      login: user.login,
      role: user.role,
      name: user.name
    };

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }

    return res.status(500).json({ 
      error: 'Authentication error',
      message: error.message
    });
  }
};

/**
 * Authorization middleware
 * Checks if user has required role/permission
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log access denied
      req.logger?.warn(`Access denied for user ${req.user.id} to ${req.path}`);
      
      return res.status(403).json({ 
        error: 'Access denied',
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

/**
 * Role hierarchy check
 * Admin > Operator > Viewer
 */
export const hasMinimumRole = (minimumRole) => {
  const roleHierarchy = {
    viewer: 1,
    operator: 2,
    admin: 3
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required'
      });
    }

    const userLevel = roleHierarchy[req.user.role] || 0;
    const requiredLevel = roleHierarchy[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        error: 'Access denied',
        message: `Requires at least ${minimumRole} role`
      });
    }

    next();
  };
};

