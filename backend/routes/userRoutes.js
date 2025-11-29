import express from 'express';
import {
  getAllUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  deleteUserController,
  changePasswordController,
  validateCreateUser,
  validateUpdateUser,
  validateChangePassword
} from '../controllers/userController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * User management routes
 * All routes require authentication
 * Admin-only routes are protected by authorize('admin')
 */
router.get('/', authenticate, authorize('admin'), getAllUsersController);
router.get('/:id', authenticate, authorize('admin'), getUserByIdController);
router.post('/', authenticate, authorize('admin'), validateCreateUser, createUserController);
router.patch('/:id', authenticate, authorize('admin'), validateUpdateUser, updateUserController);
router.delete('/:id', authenticate, authorize('admin'), deleteUserController);

// User can change their own password
router.post('/change-password', authenticate, validateChangePassword, changePasswordController);

export default router;

