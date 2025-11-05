import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';

export const LoginPage = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      // Page will refresh automatically via context
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      background: 'rgba(30, 41, 59, 0.95)',
      border: '1px solid rgba(51, 65, 85, 1)',
      borderRadius: '12px',
      padding: '40px',
      width: '100%',
      maxWidth: '400px'
    }}>
      <h1 style={{ color: '#4ade80', textAlign: 'center', marginBottom: '10px', fontSize: '24px' }}>
        Nutrition Tracker
      </h1>
      <p style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: '30px', fontSize: '13px' }}>
        Login to your account
      </p>

      <form onSubmit={handleSubmit}>
        <Input
          label="Username or Email"
          placeholder="Enter your username or email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center', fontSize: '12px' }}>
            ✗ {error}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onSwitchToRegister}
          style={{ marginTop: '10px' }}
        >
          Create New Account
        </Button>

        {/* ADD THIS PART - Optional signup link */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <p style={{ color: '#a1a1aa', fontSize: '12px' }}>
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{
                background: 'none',
                border: 'none',
                color: '#4ade80',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              Sign up here
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};