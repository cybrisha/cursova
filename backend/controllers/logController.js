import { getLogEntries } from '../services/logService.js';

/**
 * Get log entries
 */
export const getLogsController = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const filters = {
      userId: req.query.userId,
      actionType: req.query.actionType,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };

    const result = await getLogEntries(page, limit, filters);

    res.json(result);
  } catch (error) {
    req.logger?.error('Get logs error:', error);
    res.status(500).json({ 
      error: 'Failed to get logs',
      message: error.message
    });
  }
};

