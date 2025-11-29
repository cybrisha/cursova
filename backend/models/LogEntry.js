import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * LogEntry model for audit logging
 * Tracks all security-relevant actions
 */
const LogEntry = sequelize.define('LogEntry', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    },
    field: 'user_id'
  },
  actionType: {
    type: DataTypes.ENUM(
      'login',
      'logout',
      'login_failed',
      'account_blocked',
      'account_unblocked',
      'role_changed',
      'password_reset',
      'password_changed',
      'user_created',
      'user_updated',
      'user_deleted',
      'access_denied'
    ),
    allowNull: false,
    field: 'action_type'
  },
  ipAddress: {
    type: DataTypes.STRING(45),
    allowNull: true,
    field: 'ip_address'
  },
  userAgent: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'user_agent'
  },
  details: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'log_entries',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['action_type'] },
    { fields: ['timestamp'] }
  ]
});

export default LogEntry;

