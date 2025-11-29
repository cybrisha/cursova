import User from './User.js';
import Role from './Role.js';
import LogEntry from './LogEntry.js';
import TwoFactorConfig from './TwoFactorConfig.js';

/**
 * Define model relationships
 */

// User -> LogEntry (one-to-many)
User.hasMany(LogEntry, { foreignKey: 'userId', as: 'logEntries' });
LogEntry.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> TwoFactorConfig (one-to-one)
User.hasOne(TwoFactorConfig, { foreignKey: 'userId', as: 'twoFactorConfig' });
TwoFactorConfig.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export {
  User,
  Role,
  LogEntry,
  TwoFactorConfig
};

