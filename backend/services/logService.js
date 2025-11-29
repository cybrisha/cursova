import { Op } from 'sequelize';
import LogEntry from '../models/LogEntry.js';
import User from '../models/User.js';

/**
 * Create a log entry
 */
export const createLogEntry = async ({ userId, actionType, ipAddress, userAgent, details = {} }) => {
  return await LogEntry.create({
    userId,
    actionType,
    ipAddress,
    userAgent,
    details,
    timestamp: new Date()
  });
};

/**
 * Get log entries with filtering and pagination
 */
export const getLogEntries = async (page = 1, limit = 50, filters = {}) => {
  const offset = (page - 1) * limit;
  const where = {};

  if (filters.userId) {
    where.userId = filters.userId;
  }

  if (filters.actionType) {
    where.actionType = filters.actionType;
  }

  if (filters.startDate && filters.endDate) {
    where.timestamp = {
      [Op.between]: [new Date(filters.startDate), new Date(filters.endDate)]
    };
  } else if (filters.startDate) {
    where.timestamp = {
      [Op.gte]: new Date(filters.startDate)
    };
  } else if (filters.endDate) {
    where.timestamp = {
      [Op.lte]: new Date(filters.endDate)
    };
  }

  const { count, rows } = await LogEntry.findAndCountAll({
    where,
    limit,
    offset,
    order: [['timestamp', 'DESC']],
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'login', 'name', 'role']
      }
    ]
  });

  return {
    logs: rows,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
};

