import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../utils/api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login(credentials);
      const { access_token, user_role } = response.data;

      setUser({
        username: credentials.username,
        role: user_role
      }, access_token);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #151515 100%)'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '450px',
          background: '#151515',
          border: '1px solid #2a2a2a',
          borderRadius: '16px',
          padding: '3rem',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, #ff0055, #bf00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Welcome Back
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '14px' }}>
            Login to continue your hacking journey
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600
            }}>
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff0055'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.5rem',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600
            }}>
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: '#0a0a0a',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff0055'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(255, 0, 85, 0.4)' }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              background: '#ff0055',
              border: 'none',
              borderRadius: '8px',
              color: '#000',
              fontWeight: 700,
              fontSize: '16px',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '1.5rem',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </motion.button>

          <div style={{
            textAlign: 'center',
            padding: '1.5rem 0',
            borderTop: '1px solid #2a2a2a',
            marginTop: '1.5rem'
          }}>
            <p style={{ color: '#a0a0a0', fontSize: '14px' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{
                color: '#ff0055',
                textDecoration: 'none',
                fontWeight: 600
              }}>
                Register here
              </Link>
            </p>
          </div>

          {/* Demo Credentials */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: '#1f1f1f',
            borderRadius: '8px',
            border: '1px solid #2a2a2a'
          }}>
            <p style={{
              fontSize: '12px',
              color: '#a0a0a0',
              marginBottom: '0.5rem'
            }}>
              🔓 Demo Credentials:
            </p>
            <p style={{
              fontSize: '12px',
              color: '#ff0055',
              fontFamily: 'JetBrains Mono, monospace'
            }}>
              Username: admin | Password: password
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
