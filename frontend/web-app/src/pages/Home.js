import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Home = () => {
  const features = [
    {
      icon: '🎯',
      title: 'OWASP LLM Top 10',
      description: 'Master all 10 critical AI/LLM vulnerabilities through hands-on exploitation'
    },
    {
      icon: '🔐',
      title: 'Real-World Scenarios',
      description: 'Practice on authentic attack patterns from actual security incidents'
    },
    {
      icon: '🏆',
      title: 'Gamified Learning',
      description: 'Compete on leaderboards, earn badges, and track your progress'
    },
    {
      icon: '💬',
      title: 'Interactive Chat',
      description: 'Exploit vulnerable LLMs in real-time with prompt injection attacks'
    },
    {
      icon: '🤖',
      title: 'Agent Hacking',
      description: 'Break AI agents with tool confusion and excessive agency exploits'
    },
    {
      icon: '📊',
      title: 'Live Leaderboard',
      description: 'Compete globally and see how you rank against other hackers'
    }
  ];

  const stats = [
    { value: '25+', label: 'Vulnerabilities' },
    { value: '6+', label: 'Challenges' },
    { value: '10', label: 'OWASP Coverage' },
    { value: '100%', label: 'Hands-On' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
      {/* Hero Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(180deg, #0a0a0a 0%, #151515 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0.1,
          background: `
            radial-gradient(circle at 20% 50%, #ff0055 0%, transparent 50%),
            radial-gradient(circle at 80% 50%, #bf00ff 0%, transparent 50%)
          `
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto' }}
          >
            <div style={{
              display: 'inline-block',
              padding: '0.5rem 1.5rem',
              background: 'rgba(255, 0, 85, 0.1)',
              border: '1px solid #ff0055',
              borderRadius: '30px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#ff0055',
              marginBottom: '2rem',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              ⚠️ Intentionally Vulnerable Platform
            </div>

            <h1 style={{
              fontSize: '4rem',
              fontWeight: 700,
              marginBottom: '1.5rem',
              background: 'linear-gradient(135deg, #ff0055 0%, #bf00ff 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1.2
            }}>
              Master AI Security Through
              <br />
              Hands-On Exploitation
            </h1>

            <p style={{
              fontSize: '1.25rem',
              color: '#a0a0a0',
              marginBottom: '3rem',
              lineHeight: 1.8
            }}>
              Autoagenix Labs is the comprehensive platform for learning AI/LLM security vulnerabilities.
              <br />
              Practice real-world attacks in a safe, gamified environment.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/challenges">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 0, 85, 0.5)' }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '1rem 2.5rem',
                    background: '#ff0055',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#000',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    boxShadow: '0 0 20px rgba(255, 0, 85, 0.3)'
                  }}
                >
                  Start Hacking →
                </motion.button>
              </Link>
              <Link to="/chat">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    padding: '1rem 2.5rem',
                    background: 'transparent',
                    border: '2px solid #ff0055',
                    borderRadius: '8px',
                    color: '#ff0055',
                    fontWeight: 700,
                    fontSize: '16px',
                    cursor: 'pointer',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}
                >
                  Try Chat Bot
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '2rem',
              marginTop: '4rem',
              maxWidth: '800px',
              margin: '4rem auto 0'
            }}
          >
            {stats.map((stat, index) => (
              <div key={index} style={{
                textAlign: 'center',
                padding: '1.5rem',
                background: '#151515',
                borderRadius: '12px',
                border: '1px solid #2a2a2a'
              }}>
                <div style={{
                  fontSize: '2.5rem',
                  fontWeight: 700,
                  color: '#ff0055',
                  marginBottom: '0.5rem'
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#a0a0a0',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '6rem 2rem', background: '#0a0a0a' }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{
              fontSize: '3rem',
              fontWeight: 700,
              marginBottom: '1rem',
              color: '#fff'
            }}>
              What Makes Autoagenix Labs Special?
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#a0a0a0',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              The most comprehensive AI security training platform
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, borderColor: '#ff0055' }}
                style={{
                  background: '#151515',
                  border: '1px solid #2a2a2a',
                  borderRadius: '12px',
                  padding: '2rem',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: '1.25rem',
                  fontWeight: 600,
                  marginBottom: '0.75rem',
                  color: '#fff'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#a0a0a0',
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #151515 0%, #0a0a0a 100%)'
      }}>
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{
              background: '#151515',
              border: '2px solid #ff0055',
              borderRadius: '16px',
              padding: '4rem 2rem',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(255, 0, 85, 0.2)'
            }}
          >
            <h2 style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #ff0055, #bf00ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Ready to Hack Some AI?
            </h2>
            <p style={{
              fontSize: '1.125rem',
              color: '#a0a0a0',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Join the community of AI security researchers and start your journey today
            </p>
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(255, 0, 85, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '1.25rem 3rem',
                  background: '#ff0055',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#000',
                  fontWeight: 700,
                  fontSize: '18px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  boxShadow: '0 0 20px rgba(255, 0, 85, 0.3)'
                }}
              >
                Get Started For Free
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#0a0a0a',
        borderTop: '1px solid #2a2a2a',
        padding: '3rem 2rem 2rem 2rem'
      }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '3rem',
            marginBottom: '3rem'
          }}>
            {/* Brand Section */}
            <div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                marginBottom: '1rem',
                background: 'linear-gradient(135deg, #ff0055, #bf00ff)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <span style={{ fontSize: '2rem' }}>🛡️</span>
                Autoagenix Labs
              </div>
              <p style={{ color: '#a0a0a0', fontSize: '14px', lineHeight: 1.6 }}>
                The comprehensive platform for learning AI/LLM security vulnerabilities through hands-on exploitation and gamified challenges.
              </p>
            </div>

            {/* Use Cases */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Use Cases
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#ff0055', marginRight: '0.5rem' }}>✓</span>
                  <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Security Training Programs</span>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#ff0055', marginRight: '0.5rem' }}>✓</span>
                  <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Enterprise Red Team Exercises</span>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#ff0055', marginRight: '0.5rem' }}>✓</span>
                  <span style={{ color: '#a0a0a0', fontSize: '14px' }}>University AI Security Courses</span>
                </li>
                <li style={{ marginBottom: '0.75rem' }}>
                  <span style={{ color: '#ff0055', marginRight: '0.5rem' }}>✓</span>
                  <span style={{ color: '#a0a0a0', fontSize: '14px' }}>CTF Competitions</span>
                </li>
              </ul>
            </div>

            {/* Local Deployment */}
            <div>
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>
                Deploy Locally
              </h4>
              <p style={{ color: '#a0a0a0', fontSize: '14px', lineHeight: 1.6, marginBottom: '1rem' }}>
                Run Autoagenix Labs on your own infrastructure for private training sessions with custom leaderboards.
              </p>
              <div style={{
                background: '#151515',
                border: '1px solid #2a2a2a',
                borderRadius: '6px',
                padding: '0.75rem',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ff0055'
              }}>
                docker-compose up -d
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div style={{
            borderTop: '1px solid #2a2a2a',
            paddingTop: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ color: '#a0a0a0', fontSize: '14px' }}>
              Developed by{' '}
              <a
                href="https://guard0.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: '#ff0055',
                  textDecoration: 'none',
                  fontWeight: 700,
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#bf00ff'}
                onMouseOut={(e) => e.target.style.color = '#ff0055'}
              >
                Guard0
              </a>
              {' '}| Open Source AI Security Platform
            </div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <a
                href="https://github.com/yourusername/autoagenix-labs"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#a0a0a0', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = '#ff0055'}
                onMouseOut={(e) => e.target.style.color = '#a0a0a0'}
              >
                GitHub
              </a>
              <a
                href="/docs"
                style={{ color: '#a0a0a0', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = '#ff0055'}
                onMouseOut={(e) => e.target.style.color = '#a0a0a0'}
              >
                Docs
              </a>
              <Link
                to="/leaderboard"
                style={{ color: '#a0a0a0', fontSize: '14px', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.target.style.color = '#ff0055'}
                onMouseOut={(e) => e.target.style.color = '#a0a0a0'}
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
