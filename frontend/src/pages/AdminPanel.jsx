import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersAPI, logsAPI } from '../services/api';
import './AdminPanel.css';

const AdminPanel = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    name: '',
    email: '',
    role: 'viewer',
    status: 'active'
  });

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'logs') {
      loadLogs();
    }
  }, [activeTab]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data.users);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await logsAPI.getAll({ limit: 100 });
      setLogs(response.data.logs);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load logs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await usersAPI.create(formData);
      setShowCreateForm(false);
      setFormData({
        login: '',
        password: '',
        name: '',
        email: '',
        role: 'viewer',
        status: 'active'
      });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await usersAPI.update(editingUser.id, formData);
      setEditingUser(null);
      setFormData({
        login: '',
        password: '',
        name: '',
        email: '',
        role: 'viewer',
        status: 'active'
      });
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    setLoading(true);
    try {
      await usersAPI.delete(id);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      login: user.login,
      password: '',
      name: user.name,
      email: user.email || '',
      role: user.role,
      status: user.status
    });
    setShowCreateForm(true);
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'badge-danger';
      case 'operator':
        return 'badge-warning';
      case 'viewer':
        return 'badge-info';
      default:
        return 'badge-secondary';
    }
  };

  const getStatusBadgeClass = (status) => {
    return status === 'active' ? 'badge-success' : 'badge-danger';
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          Audit Logs
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {activeTab === 'users' && (
        <div className="users-section">
          <div className="section-header">
            <h2>User Management</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowCreateForm(true);
                setEditingUser(null);
                setFormData({
                  login: '',
                  password: '',
                  name: '',
                  email: '',
                  role: 'viewer',
                  status: 'active'
                });
              }}
            >
              Create User
            </button>
          </div>

          {showCreateForm && (
            <div className="card">
              <h3>{editingUser ? 'Edit User' : 'Create New User'}</h3>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Login</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.login}
                      onChange={(e) => setFormData({ ...formData, login: e.target.value })}
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password {editingUser && '(leave empty to keep current)'}</label>
                    <input
                      type="password"
                      className="form-input"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!editingUser}
                      minLength={8}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="form-input"
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="viewer">Viewer</option>
                      <option value="operator">Operator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-input"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : editingUser ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingUser(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading && !showCreateForm ? (
            <div>Loading...</div>
          ) : (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Login</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>{u.login}</td>
                      <td>{u.name}</td>
                      <td>{u.email || '-'}</td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(u.status)}`}>
                          {u.status}
                        </span>
                      </td>
                      <td>
                        {u.lastLoginAt
                          ? new Date(u.lastLoginAt).toLocaleString()
                          : 'Never'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleEditUser(u)}
                          style={{ marginRight: '5px' }}
                        >
                          Edit
                        </button>
                        {u.id !== user?.id && (
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="logs-section">
          <h2>Audit Logs</h2>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="card">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>User</th>
                    <th>Action</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.timestamp).toLocaleString()}</td>
                      <td>{log.user?.login || 'System'}</td>
                      <td>
                        <span className="badge badge-info">{log.actionType}</span>
                      </td>
                      <td>{log.ipAddress || '-'}</td>
                      <td>
                        {log.details && Object.keys(log.details).length > 0
                          ? JSON.stringify(log.details)
                          : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

