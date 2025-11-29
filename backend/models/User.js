import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import bcrypt from 'bcrypt';

/**
 * User model with authentication and role-based access control
 */
const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  login: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  role: {
    type: DataTypes.ENUM('admin', 'operator', 'viewer'),
    allowNull: false,
    defaultValue: 'viewer',
    validate: {
      isIn: [['admin', 'operator', 'viewer']]
    }
  },
  status: {
    type: DataTypes.ENUM('active', 'blocked'),
    allowNull: false,
    defaultValue: 'active',
    validate: {
      isIn: [['active', 'blocked']]
    }
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login_at'
  },
  failedLoginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'failed_login_attempts'
  },
  lockedUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'locked_until'
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  hooks: {
    // Hash password before creating/updating
    beforeCreate: async (user) => {
      if (user.passwordHash && !user.passwordHash.startsWith('$2')) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, parseInt(process.env.BCRYPT_ROUNDS || 12));
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('passwordHash') && !user.passwordHash.startsWith('$2')) {
        user.passwordHash = await bcrypt.hash(user.passwordHash, parseInt(process.env.BCRYPT_ROUNDS || 12));
      }
    }
  }
});

/**
 * Instance method to verify password
 */
User.prototype.verifyPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

/**
 * Instance method to check if account is locked
 */
User.prototype.isLocked = function() {
  if (this.lockedUntil) {
    return new Date() < this.lockedUntil;
  }
  return false;
};

/**
 * Instance method to reset failed login attempts
 */
User.prototype.resetFailedAttempts = async function() {
  this.failedLoginAttempts = 0;
  this.lockedUntil = null;
  await this.save();
};

/**
 * Instance method to increment failed login attempts
 */
User.prototype.incrementFailedAttempts = async function() {
  this.failedLoginAttempts += 1;
  const maxAttempts = parseInt(process.env.LOGIN_ATTEMPT_LIMIT || 5);
  const lockDuration = parseInt(process.env.LOGIN_WINDOW_MS || 600000);
  
  if (this.failedLoginAttempts >= maxAttempts) {
    this.lockedUntil = new Date(Date.now() + lockDuration);
  }
  await this.save();
};

export default User;

