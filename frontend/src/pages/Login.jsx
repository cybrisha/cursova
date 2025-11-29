import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [tempToken, setTempToken] = useState(null);
  const { login: loginUser, verify2FA } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (requires2FA && tempToken) {
      // Verify 2FA code
      const result = await verify2FA(tempToken, token);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || '2FA verification failed');
      }
    } else {
      // Initial login
      const result = await loginUser(login, password);

      if (result.success) {
        navigate('/dashboard');
      } else if (result.requires2FA) {
        setRequires2FA(true);
        setTempToken(result.tempToken);
        setError(''); // Clear any previous errors
      } else {
        setError(result.error || 'Login failed');
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Authentication System</h1>
        <h2>Critical Infrastructure</h2>
        <form onSubmit={handleSubmit}>
          {!requires2FA ? (
            <>
              <div className="form-group">
                <label className="form-label">Login</label>
                <input
                  type="text"
                  className="form-input"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  required
                  autoFocus
                  disabled={loading}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Enter 2FA Code</label>
                <input
                  type="text"
                  className="form-input"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                  disabled={loading}
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.2em' }}
                />
                <p style={{ marginTop: '0.5rem', fontSize: '0.9em', color: '#666' }}>
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setRequires2FA(false);
                  setTempToken(null);
                  setToken('');
                  setError('');
                }}
                disabled={loading}
                style={{ marginBottom: '1rem' }}
              >
                Back to Login
              </button>
            </>
          )}
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading 
              ? (requires2FA ? 'Verifying...' : 'Logging in...') 
              : (requires2FA ? 'Verify' : 'Login')}
          </button>
        </form>
        <div className="login-info">
          <p>Default credentials:</p>
          <p>Admin: admin / Admin123!</p>
          <p>Operator: operator / Operator123!</p>
          <p>Viewer: viewer / Viewer123!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

