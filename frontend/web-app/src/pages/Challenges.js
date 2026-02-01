import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { challengeAPI } from '../utils/api';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [categories, setCategories] = useState({});
  const [filter, setFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState([]);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionData, setSubmissionData] = useState({
    solution: '',
    evidence: '',
    response_text: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useStore();

  useEffect(() => {
    fetchChallenges();
    if (user) {
      fetchUserProgress();
    }
  }, [user]);

  const fetchChallenges = async () => {
    try {
      const response = await challengeAPI.getChallenges();
      const data = response.data;
      setChallenges(data.challenges || []);
      setCategories(data.categories || {});
    } catch (error) {
      toast.error('Failed to load challenges');
      console.error('Challenge fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProgress = async () => {
    if (!user?.username) return;
    
    try {
      const response = await challengeAPI.getUserProgress(user.username);
      setUserProgress(response.data.progress || []);
    } catch (error) {
      console.error('Progress fetch error:', error);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: '#ff0055',
      medium: '#ffbe0b',
      hard: '#ff006e'
    };
    return colors[difficulty?.toLowerCase()] || '#ff0055';
  };

  const getOwaspColor = (owaspCategory) => {
    const colors = {
      'LLM01': '#ff4757',
      'LLM02': '#ff6b8a',
      'LLM03': '#ff7f7f',
      'LLM04': '#ff9ff3',
      'LLM05': '#9c88ff',
      'LLM06': '#70a1ff',
      'LLM07': '#5352ed',
      'LLM08': '#3742fa',
      'LLM09': '#2f3542',
      'LLM10': '#57606f'
    };
    return colors[owaspCategory] || '#a4b0be';
  };

  const isChallengeSolved = (challengeId) => {
    return userProgress.some(p => p.challenge_id === challengeId);
  };

  const getChallengeScore = (challengeId) => {
    const progress = userProgress.find(p => p.challenge_id === challengeId);
    return progress?.points || 0;
  };

  const filteredChallenges = challenges.filter(c => {
    const categoryMatch = filter === 'all' || c.category === filter;
    const difficultyMatch = difficultyFilter === 'all' || c.difficulty?.toLowerCase() === difficultyFilter;
    return categoryMatch && difficultyMatch;
  });

  const handleChallengeClick = (challenge) => {
    setSelectedChallenge(challenge);
    setShowSubmissionModal(true);
    setSubmissionData({
      solution: '',
      evidence: '',
      response_text: ''
    });
  };

  const handleSubmission = async () => {
    if (!user) {
      toast.error('Please login to submit solutions');
      return;
    }

    if (!submissionData.response_text.trim() && !submissionData.solution.trim()) {
      toast.error('Please provide a solution or response text');
      return;
    }

    setSubmitting(true);

    try {
      const submission = {
        challenge_id: selectedChallenge.id,
        user_id: user.username,
        solution: submissionData.solution ? JSON.parse(submissionData.solution) : {},
        evidence: submissionData.evidence ? JSON.parse(submissionData.evidence) : {},
        response_text: submissionData.response_text
      };

      const response = await challengeAPI.submitChallenge(submission);
      const result = response.data;

      if (result.status === 'success') {
        toast.success(result.message);
        setShowSubmissionModal(false);
        fetchUserProgress(); // Refresh progress
      } else if (result.status === 'already_solved') {
        toast.info(result.message);
      } else {
        toast.error(result.message);
      }

    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Submission failed';
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const getHint = async (challengeId, level) => {
    if (!user) {
      toast.error('Please login to get hints');
      return;
    }

    try {
      const response = await challengeAPI.getHint(challengeId, level);
      const result = response.data;
      
      toast.success(`Hint: ${result.hint}`, { duration: 8000 });
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to get hint';
      toast.error(errorMsg);
    }
  };

  const owaspMapping = {
    'LLM01': 'Prompt Injection',
    'LLM02': 'Insecure Output Handling',
    'LLM03': 'Training Data Poisoning',
    'LLM04': 'Model Denial of Service',
    'LLM05': 'Supply Chain Vulnerabilities',
    'LLM06': 'Sensitive Information Disclosure',
    'LLM07': 'Insecure Plugin Design',
    'LLM08': 'Excessive Agency',
    'LLM09': 'Overreliance',
    'LLM10': 'Model Theft'
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', padding: '4rem 2rem', background: '#0a0a0a' }}>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: '3rem' }}
        >
          <h1 style={{
            fontSize: '3rem',
            fontWeight: 700,
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #ff0055, #bf00ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            OWASP LLM Top 10 Challenges
          </h1>
          <p style={{ fontSize: '1.125rem', color: '#a0a0a0', maxWidth: '800px', marginBottom: '2rem' }}>
            Master AI security through hands-on exploitation of the OWASP LLM Top 10 vulnerabilities. 
            Each challenge teaches real-world attack vectors and defensive strategies.
          </p>
          
          {user && (
            <div style={{ 
              display: 'flex', 
              gap: '2rem', 
              padding: '1rem', 
              background: '#151515', 
              borderRadius: '12px',
              border: '1px solid #2a2a2a',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Total Score: </span>
                <span style={{ color: '#ff0055', fontSize: '20px', fontWeight: 700 }}>
                  {userProgress.reduce((sum, p) => sum + p.points, 0)} pts
                </span>
              </div>
              <div>
                <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Solved: </span>
                <span style={{ color: '#bf00ff', fontSize: '16px', fontWeight: 600 }}>
                  {userProgress.length} / {challenges.length}
                </span>
              </div>
              <div>
                <span style={{ color: '#a0a0a0', fontSize: '14px' }}>Progress: </span>
                <span style={{ color: '#ffbe0b', fontSize: '16px', fontWeight: 600 }}>
                  {challenges.length > 0 ? Math.round((userProgress.length / challenges.length) * 100) : 0}%
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                padding: '0.75rem 1.5rem',
                background: filter === 'all' ? '#ff0055' : 'transparent',
                border: filter === 'all' ? 'none' : '2px solid #2a2a2a',
                borderRadius: '8px',
                color: filter === 'all' ? '#000' : '#a0a0a0',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}
            >
              All Categories ({challenges.length})
            </button>
            {Object.entries(categories).map(([category, categoryChallengess]) => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: filter === category ? '#ff0055' : 'transparent',
                  border: filter === category ? 'none' : '2px solid #2a2a2a',
                  borderRadius: '8px',
                  color: filter === category ? '#000' : '#a0a0a0',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}
              >
                {category} ({categoryChallengess.length})
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {['all', 'easy', 'medium', 'hard'].map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setDifficultyFilter(difficulty)}
                style={{
                  padding: '0.5rem 1rem',
                  background: difficultyFilter === difficulty ? getDifficultyColor(difficulty) : 'transparent',
                  border: `2px solid ${difficultyFilter === difficulty ? 'transparent' : '#2a2a2a'}`,
                  borderRadius: '6px',
                  color: difficultyFilter === difficulty ? '#000' : '#a0a0a0',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#a0a0a0' }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔄</div>
            <p>Loading challenges...</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '2rem'
          }}>
            {filteredChallenges.map((challenge, index) => {
              const isSolved = isChallengeSolved(challenge.id);
              const challengeScore = getChallengeScore(challenge.id);
              
              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ y: -8, borderColor: getDifficultyColor(challenge.difficulty) }}
                  style={{
                    background: isSolved ? 'linear-gradient(135deg, #1a2a1a, #151515)' : '#151515',
                    border: `2px solid ${isSolved ? '#ff0055' : '#2a2a2a'}`,
                    borderRadius: '16px',
                    padding: '2rem',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => handleChallengeClick(challenge)}
                >
                  {/* Solved Badge */}
                  {isSolved && (
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      right: '1rem',
                      background: '#ff0055',
                      color: '#000',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ✓ Solved
                    </div>
                  )}

                  {/* OWASP Category */}
                  {challenge.owasp_category && (
                    <div style={{
                      display: 'inline-block',
                      padding: '0.25rem 0.75rem',
                      background: getOwaspColor(challenge.owasp_category),
                      color: '#fff',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      marginBottom: '1rem'
                    }}>
                      {challenge.owasp_category}: {owaspMapping[challenge.owasp_category]}
                    </div>
                  )}

                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        display: 'inline-block',
                        padding: '0.25rem 0.75rem',
                        background: `${getDifficultyColor(challenge.difficulty)}20`,
                        color: getDifficultyColor(challenge.difficulty),
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '0.75rem'
                      }}>
                        {challenge.difficulty || 'Easy'}
                      </div>
                      <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: 600,
                        color: '#fff',
                        marginBottom: '0.5rem',
                        lineHeight: 1.3
                      }}>
                        {challenge.name}
                      </h3>
                      <p style={{
                        fontSize: '12px',
                        color: '#a0a0a0',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        marginBottom: '0.5rem'
                      }}>
                        {challenge.category}
                      </p>
                    </div>
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: '#1f1f1f',
                      borderRadius: '8px',
                      color: isSolved ? '#ff0055' : '#fff',
                      fontWeight: 700,
                      fontSize: '16px',
                      textAlign: 'center',
                      minWidth: '80px'
                    }}>
                      {isSolved ? `+${challengeScore}` : challenge.points} pts
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{
                    color: '#a0a0a0',
                    fontSize: '14px',
                    lineHeight: 1.6,
                    marginBottom: '1.5rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {challenge.description || 'Complete this challenge to earn points and advance your skills.'}
                  </p>

                  {/* Learning Objectives */}
                  {challenge.learning_objectives && challenge.learning_objectives.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ color: '#fff', fontSize: '12px', fontWeight: 600, marginBottom: '0.5rem' }}>
                        📚 Learning Objectives:
                      </p>
                      <ul style={{ 
                        color: '#a0a0a0', 
                        fontSize: '11px', 
                        paddingLeft: '1rem',
                        margin: 0,
                        listStyle: 'none'
                      }}>
                        {challenge.learning_objectives.slice(0, 2).map((objective, idx) => (
                          <li key={idx} style={{ marginBottom: '0.25rem' }}>
                            • {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        background: isSolved ? 'transparent' : `linear-gradient(135deg, ${getDifficultyColor(challenge.difficulty)}, ${getDifficultyColor(challenge.difficulty)}80)`,
                        border: `2px solid ${getDifficultyColor(challenge.difficulty)}`,
                        borderRadius: '8px',
                        color: isSolved ? getDifficultyColor(challenge.difficulty) : '#000',
                        fontWeight: 600,
                        fontSize: '14px',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {isSolved ? 'View Solution' : 'Start Challenge'} →
                    </motion.button>
                    
                    {user && !isSolved && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          getHint(challenge.id, 1);
                        }}
                        style={{
                          padding: '0.75rem',
                          background: 'transparent',
                          border: '2px solid #666',
                          borderRadius: '8px',
                          color: '#666',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        💡
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {filteredChallenges.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '4rem',
            color: '#a0a0a0'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>No challenges found</h3>
            <p>Try selecting different filters</p>
          </div>
        )}

        {/* Submission Modal */}
        <AnimatePresence>
          {showSubmissionModal && selectedChallenge && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0, 0, 0, 0.8)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '2rem'
              }}
              onClick={() => setShowSubmissionModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                style={{
                  background: '#151515',
                  border: '2px solid #2a2a2a',
                  borderRadius: '16px',
                  padding: '2rem',
                  maxWidth: '800px',
                  width: '100%',
                  maxHeight: '80vh',
                  overflowY: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
                      {selectedChallenge.name}
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: `${getDifficultyColor(selectedChallenge.difficulty)}20`,
                        color: getDifficultyColor(selectedChallenge.difficulty),
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600
                      }}>
                        {selectedChallenge.difficulty}
                      </span>
                      <span style={{ color: '#a0a0a0', fontSize: '14px' }}>{selectedChallenge.points} pts</span>
                      {selectedChallenge.owasp_category && (
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          background: getOwaspColor(selectedChallenge.owasp_category),
                          color: '#fff',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600
                        }}>
                          {selectedChallenge.owasp_category}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#a0a0a0',
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '0.5rem'
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                  <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '1rem' }}>📋 Challenge Description</h3>
                  <p style={{ color: '#a0a0a0', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                    {selectedChallenge.description}
                  </p>
                </div>

                {selectedChallenge.learning_objectives && (
                  <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '1rem' }}>🎯 Learning Objectives</h3>
                    <ul style={{ color: '#a0a0a0', fontSize: '14px', paddingLeft: '1.5rem' }}>
                      {selectedChallenge.learning_objectives.map((objective, idx) => (
                        <li key={idx} style={{ marginBottom: '0.5rem' }}>{objective}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {!user ? (
                  <div style={{ 
                    background: '#2a1a1a', 
                    border: '1px solid #ff006e', 
                    borderRadius: '8px', 
                    padding: '1.5rem',
                    textAlign: 'center'
                  }}>
                    <p style={{ color: '#ff006e', marginBottom: '1rem' }}>Please login to submit solutions</p>
                    <button
                      onClick={() => setShowSubmissionModal(false)}
                      style={{
                        padding: '0.75rem 1.5rem',
                        background: '#ff006e',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ color: '#fff', fontSize: '16px', marginBottom: '1rem' }}>💡 Submit Your Solution</h3>
                    
                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', color: '#fff', fontSize: '14px', marginBottom: '0.5rem' }}>
                        Response Text (Required) - Paste the AI's response that demonstrates the vulnerability
                      </label>
                      <textarea
                        value={submissionData.response_text}
                        onChange={(e) => setSubmissionData({...submissionData, response_text: e.target.value})}
                        placeholder="Paste the AI response that shows you've successfully exploited the vulnerability..."
                        style={{
                          width: '100%',
                          height: '120px',
                          padding: '1rem',
                          background: '#0a0a0a',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '14px',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', color: '#fff', fontSize: '14px', marginBottom: '0.5rem' }}>
                        Solution Details (JSON) - Optional structured data
                      </label>
                      <textarea
                        value={submissionData.solution}
                        onChange={(e) => setSubmissionData({...submissionData, solution: e.target.value})}
                        placeholder='{"method": "prompt_injection", "payload": "..."}'
                        style={{
                          width: '100%',
                          height: '80px',
                          padding: '1rem',
                          background: '#0a0a0a',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div style={{ marginBottom: '2rem' }}>
                      <label style={{ display: 'block', color: '#fff', fontSize: '14px', marginBottom: '0.5rem' }}>
                        Evidence (JSON) - Optional proof or metadata
                      </label>
                      <textarea
                        value={submissionData.evidence}
                        onChange={(e) => setSubmissionData({...submissionData, evidence: e.target.value})}
                        placeholder='{"tool_used": "run_command", "expected_tool": "read_file"}'
                        style={{
                          width: '100%',
                          height: '60px',
                          padding: '1rem',
                          background: '#0a0a0a',
                          border: '1px solid #2a2a2a',
                          borderRadius: '8px',
                          color: '#fff',
                          fontSize: '12px',
                          fontFamily: 'monospace',
                          resize: 'vertical'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button
                        onClick={handleSubmission}
                        disabled={submitting || !submissionData.response_text.trim()}
                        style={{
                          flex: 1,
                          padding: '1rem',
                          background: submitting || !submissionData.response_text.trim() 
                            ? '#2a2a2a' 
                            : 'linear-gradient(135deg, #ff0055, #bf00ff)',
                          border: 'none',
                          borderRadius: '8px',
                          color: submitting || !submissionData.response_text.trim() ? '#666' : '#000',
                          fontWeight: 700,
                          fontSize: '16px',
                          cursor: submitting || !submissionData.response_text.trim() ? 'not-allowed' : 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
                      >
                        {submitting ? 'Validating...' : 'Submit Solution'}
                      </button>
                      
                      <button
                        onClick={() => getHint(selectedChallenge.id, 1)}
                        style={{
                          padding: '1rem',
                          background: 'transparent',
                          border: '2px solid #ffbe0b',
                          borderRadius: '8px',
                          color: '#ffbe0b',
                          fontWeight: 600,
                          fontSize: '14px',
                          cursor: 'pointer'
                        }}
                      >
                        💡 Hint
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Challenges;