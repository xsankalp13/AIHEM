import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';

const Dashboard = () => {
  const { user, isAuthenticated } = useStore();

  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ color: '#00ff88', marginBottom: '1rem' }}>Please login to view your dashboard</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '4rem 2rem', background: '#0a0a0a' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '2rem', background: 'linear-gradient(135deg, #00ff88, #00d9ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Welcome back, {user?.username}!
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginTop: '3rem' }}>
            <div style={{ background: '#151515', padding: '2rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#00ff88', marginBottom: '0.5rem' }}>0</div>
              <div style={{ color: '#a0a0a0' }}>Challenges Completed</div>
            </div>
            <div style={{ background: '#151515', padding: '2rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#00d9ff', marginBottom: '0.5rem' }}>0</div>
              <div style={{ color: '#a0a0a0' }}>Total Points</div>
            </div>
            <div style={{ background: '#151515', padding: '2rem', borderRadius: '12px', border: '1px solid #2a2a2a' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#ffbe0b', marginBottom: '0.5rem' }}>-</div>
              <div style={{ color: '#a0a0a0' }}>Global Rank</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
