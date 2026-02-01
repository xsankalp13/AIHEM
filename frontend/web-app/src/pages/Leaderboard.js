import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { challengeAPI } from '../utils/api';

const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await challengeAPI.getLeaderboard();
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Failed to load leaderboard');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '4rem 2rem', background: '#0a0a0a' }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1rem', background: 'linear-gradient(135deg, #ff0055, #bf00ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            🏆 Leaderboard
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#a0a0a0', marginBottom: '3rem' }}>
            Top hackers on the platform
          </p>

          {leaderboard.length > 0 ? (
            <div style={{ background: '#151515', borderRadius: '12px', border: '1px solid #2a2a2a', overflow: 'hidden' }}>
              {leaderboard.map((player, index) => (
                <motion.div
                  key={player.user_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '1.5rem',
                    borderBottom: index < leaderboard.length - 1 ? '1px solid #2a2a2a' : 'none',
                    background: index < 3 ? '#1f1f1f' : 'transparent'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : '#2a2a2a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    marginRight: '1.5rem',
                    color: index < 3 ? '#000' : '#fff'
                  }}>
                    #{index + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{player.user_id}</div>
                    <div style={{ fontSize: '14px', color: '#a0a0a0' }}>{player.challenges_solved || 0} challenges solved</div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ff0055' }}>
                    {player.score} pts
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#a0a0a0' }}>
              No rankings yet. Be the first!
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;
