import { useState, useEffect } from 'react';
import { logsAPI } from '../services/api';
import './Logs.css';

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    actionType: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    loadLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.actionType, filters.startDate, filters.endDate]);

  const loadLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 50,
        ...filters
      };
      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (params[key] === '') {
          delete params[key];
        }
      });

      const response = await logsAPI.getAll(params);
      setLogs(response.data.logs);
      setTotalPages(response.data.pagination.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setFilters({
      actionType: '',
      startDate: '',
      endDate: ''
    });
    setPage(1);
  };

  const formatActionType = (actionType) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActionBadgeClass = (actionType) => {
    if (actionType.includes('login') || actionType.includes('logout')) {
      return 'badge-success';
    }
    if (actionType.includes('failed') || actionType.includes('blocked') || actionType.includes('denied')) {
      return 'badge-danger';
    }
    if (actionType.includes('password') || actionType.includes('changed')) {
      return 'badge-warning';
    }
    return 'badge-info';
  };

  return (
    <div className="logs-page">
      <h1>Audit Logs</h1>

      {error && <div className="error-message">{error}</div>}

      <div className="logs-filters card">
        <h3>Filters</h3>
        <div className="filters-row">
          <div className="form-group">
            <label className="form-label">Action Type</label>
            <select
              className="form-input"
              name="actionType"
              value={filters.actionType}
              onChange={handleFilterChange}
            >
              <option value="">All Actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="login_failed">Login Failed</option>
              <option value="account_blocked">Account Blocked</option>
              <option value="account_unblocked">Account Unblocked</option>
              <option value="role_changed">Role Changed</option>
              <option value="password_reset">Password Reset</option>
              <option value="password_changed">Password Changed</option>
              <option value="user_created">User Created</option>
              <option value="user_updated">User Updated</option>
              <option value="user_deleted">User Deleted</option>
              <option value="access_denied">Access Denied</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-input"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-input"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <button
              className="btn btn-secondary"
              onClick={clearFilters}
              style={{ marginTop: '25px' }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      <div className="logs-table card">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Loading logs...</div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>No logs found</div>
        ) : (
          <>
            <table className="table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>IP Address</th>
                  <th>User Agent</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                    <td>
                      {log.user ? (
                        <span>
                          {log.user.login} ({log.user.name})
                        </span>
                      ) : (
                        <span className="text-muted">System</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${getActionBadgeClass(log.actionType)}`}>
                        {formatActionType(log.actionType)}
                      </span>
                    </td>
                    <td>{log.ipAddress || '-'}</td>
                    <td className="user-agent-cell">
                      {log.userAgent ? (
                        <span title={log.userAgent}>
                          {log.userAgent.length > 50
                            ? log.userAgent.substring(0, 50) + '...'
                            : log.userAgent}
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="details-cell">
                      {log.details && Object.keys(log.details).length > 0 ? (
                        <details>
                          <summary>View Details</summary>
                          <pre>{JSON.stringify(log.details, null, 2)}</pre>
                        </details>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() => setPage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1 || loading}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages || loading}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;

