import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login delay
    setTimeout(() => {
      setIsLoading(false);
      // Your actual login logic here
      console.log('Login attempted with:', credentials);
      
      // Navigate to dashboard on successful login
      navigate('/dashboard');
    }, 1500);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSwitchToSignup = () => {
    navigate('/signup');
  };

  return (
    <div className="login-container">
      {/* Animated background grid */}
      <div className="grid-background">
        <div className="grid-line horizontal"></div>
        <div className="grid-line horizontal"></div>
        <div className="grid-line horizontal"></div>
        <div className="grid-line vertical"></div>
        <div className="grid-line vertical"></div>
        <div className="grid-line vertical"></div>
      </div>

      {/* Status indicator */}
      <div className="status-bar">
        <div className="status-dot"></div>
        <span className="status-text">System Online</span>
      </div>

      {/* Main login card */}
      <div className="login-card">
        <div className="login-header">
          <div className="logo-section">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <h1>SAT Monitor</h1>
              <p>System Administration & Trunk Monitoring</p>
            </div>
          </div>
          <div className="organization">Skywave Technologies</div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              placeholder="admin"
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : (
              'Access System'
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="divider">
            <span>Need admin access?</span>
          </div>
          <button className="switch-button" onClick={handleSwitchToSignup}>
            Create New Account
          </button>
          <div className="security-notice">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
              <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/>
            </svg>
            <span>Internal Network Only</span>
          </div>
        </div>
      </div>

      {/* Decorative amethyst accent */}
      <div className="accent-glow"></div>
    </div>
  );
};

export default Login;
