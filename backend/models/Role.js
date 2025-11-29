import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

/**
 * Role model for role-based access control
 * Predefined roles: admin, operator, viewer
 */
const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 50]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'roles',
  timestamps: true,
  underscored: true
});

export default Role;

