import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Input } from '../Common/Input';
import { Button } from '../Common/Button';

export const RegisterPage = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const { register } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      await register(
        formData.name,
        formData.username,
        formData.email,
        formData.password
      );
      setSuccess('✅ Account created! Switching to login...');
      setTimeout(onSwitchToLogin, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed');
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
        Create Account
      </h1>
      <p style={{ color: '#a1a1aa', textAlign: 'center', marginBottom: '30px', fontSize: '13px' }}>
        Join Nutrition Tracker
      </p>

      <form onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          placeholder="Enter your full name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          disabled={loading}
        />

        <Input
          label="Username"
          placeholder="Choose a username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          disabled={loading}
        />

        <Input
          label="Email"
          type="email"
          placeholder="Enter your email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          disabled={loading}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Enter password (min 6 chars)"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={loading}
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          disabled={loading}
        />

        {error && (
          <div style={{ color: '#ef4444', marginBottom: '16px', textAlign: 'center', fontSize: '12px' }}>
            ❌ {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#4ade80', marginBottom: '16px', textAlign: 'center', fontSize: '12px' }}>
            {success}
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onSwitchToLogin}
          style={{ marginTop: '10px' }}
        >
          Back to Login
        </Button>
      </form>
    </div>
  );
};