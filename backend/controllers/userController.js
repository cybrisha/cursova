import { body, validationResult } from 'express-validator';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  changePassword
} from '../services/userService.js';

/**
 * Validation rules for user creation
 */
export const validateCreateUser = [
  body('login')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Login must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Login must contain only letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('role')
    .optional()
    .isIn(['admin', 'operator', 'viewer'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['active', 'blocked'])
    .withMessage('Invalid status')
];

/**
 * Validation rules for user update
 */
export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Invalid email format'),
  body('role')
    .optional()
    .isIn(['admin', 'operator', 'viewer'])
    .withMessage('Invalid role'),
  body('status')
    .optional()
    .isIn(['active', 'blocked'])
    .withMessage('Invalid status'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
];

/**
 * Validation rules for password change
 */
export const validateChangePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
];

/**
 * Get all users
 */
export const getAllUsersController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      role: req.query.role,
      status: req.query.status,
      search: req.query.search
    };

    const result = await getAllUsers(page, limit, filters);

    res.json(result);
  } catch (error) {
    req.logger?.error('Get all users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      message: error.message
    });
  }
};

/**
 * Get user by ID
 */
export const getUserByIdController = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);

    res.json({ user });
  } catch (error) {
    req.logger?.error('Get user by ID error:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to get user',
      message: error.message
    });
  }
};

/**
 * Create user
 */
export const createUserController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = await createUser(req.body, req.user.id);

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    req.logger?.error('Create user error:', error);
    const statusCode = error.message === 'Login already exists' ? 409 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to create user',
      message: error.message
    });
  }
};

/**
 * Update user
 */
export const updateUserController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const user = await updateUser(id, req.body, req.user.id);

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    req.logger?.error('Update user error:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to update user',
      message: error.message
    });
  }
};

/**
 * Delete user
 */
export const deleteUserController = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent self-deletion
    if (id === req.user.id) {
      return res.status(400).json({ 
        error: 'Cannot delete your own account'
      });
    }

    await deleteUser(id, req.user.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    req.logger?.error('Delete user error:', error);
    const statusCode = error.message === 'User not found' ? 404 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to delete user',
      message: error.message
    });
  }
};

/**
 * Change password
 */
export const changePasswordController = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        errors: errors.array()
      });
    }

    const { oldPassword, newPassword } = req.body;
    await changePassword(req.user.id, oldPassword, newPassword);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    req.logger?.error('Change password error:', error);
    const statusCode = error.message === 'Current password is incorrect' ? 401 : 500;
    res.status(statusCode).json({ 
      error: 'Failed to change password',
      message: error.message
    });
  }
};

