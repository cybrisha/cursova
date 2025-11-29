import { Op } from 'sequelize';
import User from '../models/User.js';
import { createLogEntry } from './logService.js';

/**
 * Get all users (with pagination)
 */
export const getAllUsers = async (page = 1, limit = 10, filters = {}) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (filters.role) {
    where.role = filters.role;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where[Op.or] = [
      { login: { [Op.iLike]: `%${filters.search}%` } },
      { name: { [Op.iLike]: `%${filters.search}%` } },
      { email: { [Op.iLike]: `%${filters.search}%` } }
    ];
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: { exclude: ['passwordHash'] }
  });

  return {
    users: rows,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  const user = await User.findByPk(id, {
    attributes: { exclude: ['passwordHash'] }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

/**
 * Create new user
 */
export const createUser = async (userData, adminId) => {
  // Check if login already exists
  const existingUser = await User.findOne({ where: { login: userData.login } });
  if (existingUser) {
    throw new Error('Login already exists');
  }

  const user = await User.create({
    login: userData.login,
    passwordHash: userData.password, // Will be hashed by hook
    name: userData.name,
    email: userData.email,
    role: userData.role || 'viewer',
    status: userData.status || 'active'
  });

  // Log user creation
  await createLogEntry({
    userId: adminId,
    actionType: 'user_created',
    details: {
      createdUserId: user.id,
      login: user.login,
      role: user.role
    }
  });

  return user.toJSON();
};

/**
 * Update user
 */
export const updateUser = async (id, updates, adminId) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  const oldRole = user.role;
  const oldStatus = user.status;

  // Update fields
  if (updates.name !== undefined) user.name = updates.name;
  if (updates.email !== undefined) user.email = updates.email;
  if (updates.role !== undefined) user.role = updates.role;
  if (updates.status !== undefined) user.status = updates.status;
  if (updates.password) user.passwordHash = updates.password; // Will be hashed by hook

  await user.save();

  // Log changes
  if (oldRole !== user.role) {
    await createLogEntry({
      userId: adminId,
      actionType: 'role_changed',
      details: {
        targetUserId: user.id,
        oldRole,
        newRole: user.role
      }
    });
  }

  if (oldStatus !== user.status) {
    await createLogEntry({
      userId: adminId,
      actionType: user.status === 'blocked' ? 'account_blocked' : 'account_unblocked',
      details: {
        targetUserId: user.id
      }
    });
  }

  if (updates.password) {
    await createLogEntry({
      userId: adminId,
      actionType: 'password_reset',
      details: {
        targetUserId: user.id
      }
    });
  }

  await createLogEntry({
    userId: adminId,
    actionType: 'user_updated',
    details: {
      targetUserId: user.id,
      updates
    }
  });

  const userJson = user.toJSON();
  delete userJson.passwordHash;
  return userJson;
};

/**
 * Delete user
 */
export const deleteUser = async (id, adminId) => {
  const user = await User.findByPk(id);

  if (!user) {
    throw new Error('User not found');
  }

  await user.destroy();

  await createLogEntry({
    userId: adminId,
    actionType: 'user_deleted',
    details: {
      deletedUserId: id,
      login: user.login
    }
  });
};

/**
 * Change user's own password
 */
export const changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Verify old password
  const isValid = await user.verifyPassword(oldPassword);
  if (!isValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.passwordHash = newPassword; // Will be hashed by hook
  await user.save();

  // Log password change
  await createLogEntry({
    userId: user.id,
    actionType: 'password_changed',
    details: {}
  });
};

