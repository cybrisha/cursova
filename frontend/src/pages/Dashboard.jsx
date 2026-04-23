import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isOperator } = useAuth();

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="card">
          <h2>Welcome, {user?.name}!</h2>
          <p>You are logged in as <strong>{user?.role}</strong></p>
          <p>Login: {user?.login}</p>
          {user?.email && <p>Email: {user?.email}</p>}
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <ul className="action-list">
            <li>
              <a href="/profile">Update Profile</a>
            </li>
            <li>
              <a href="/2fa">Configure Two-Factor Authentication</a>
            </li>
            {isOperator && (
              <li>
                <a href="/password-generation">Password generation</a>
              </li>
            )}
            {user?.role === 'admin' && (
              <>
                <li>
                  <a href="/admin">Manage Users</a>
                </li>
                <li>
                  <a href="/admin/logs">View Audit Logs</a>
                </li>
              </>
            )}
          </ul>
        </div>

        <div className="card">
          <h3>System Information</h3>
          <p>This is a prototype authentication system for critical infrastructure.</p>
          <p>Features:</p>
          <ul>
            <li>JWT-based authentication</li>
            <li>Role-based access control</li>
            <li>Audit logging</li>
            <li>Brute-force protection</li>
            <li>Optional 2FA</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

