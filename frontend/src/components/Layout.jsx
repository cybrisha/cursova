import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

const Layout = () => {
  const { user, logout, isAdmin, isOperator } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <Link to="/dashboard">Auth System</Link>
          </div>
          <div className="nav-menu">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            {isAdmin && (
              <>
                <Link to="/admin" className="nav-link">Admin Panel</Link>
                <Link to="/admin/logs" className="nav-link">Logs</Link>
              </>
            )}
            {isOperator && (
              <Link to="/password-generation" className="nav-link">Password generation</Link>
            )}
            <Link to="/2fa" className="nav-link">2FA Setup</Link>
            <div className="nav-user">
              <span>{user?.name} ({user?.role})</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;

