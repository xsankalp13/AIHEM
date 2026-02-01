import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';
import logo from '../assets/logo.png';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/chat', label: 'Chat' },
    { path: '/challenges', label: 'Challenges' },
    { path: '/leaderboard', label: 'Leaderboard' },
    { path: '/dashboard', label: 'Dashboard', auth: true },
    { path: '/playground', label: 'Playground' },
  ];

  return (
    <nav style={{
      background: '#151515',
      borderBottom: '1px solid #2a2a2a',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem'
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <img src={logo} alt="Autoagenix Labs" style={{ height: '40px', borderRadius: '8px' }} />
            <span style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #00ff88, #00d9ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Autoagenix Labs
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '2rem'
        }} className="desktop-nav">
          {navLinks.map(link => {
            if (link.auth && !isAuthenticated) return null;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  color: '#a0a0a0',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => e.target.style.color = '#00ff88'}
                onMouseLeave={(e) => e.target.style.color = '#a0a0a0'}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <>
              <div style={{
                padding: '0.5rem 1rem',
                background: '#1f1f1f',
                borderRadius: '8px',
                color: '#00ff88',
                fontSize: '14px',
                fontWeight: 600
              }}>
                {user?.username}
              </div>
              <button
                onClick={handleLogout}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '2px solid #00ff88',
                  borderRadius: '8px',
                  color: '#00ff88',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#00ff88';
                  e.target.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#00ff88';
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: 'transparent',
                  border: '2px solid #00ff88',
                  borderRadius: '8px',
                  color: '#00ff88',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Login
                </button>
              </Link>
              <Link to="/register">
                <button style={{
                  padding: '0.75rem 1.5rem',
                  background: '#00ff88',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)'
                }}>
                  Register
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
