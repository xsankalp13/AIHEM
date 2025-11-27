import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - Use Kong gateway
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (data) => api.post('/api/auth/register', data),
  verify: (token) => api.get('/api/auth/verify', {
    headers: { Authorization: `Bearer ${token}` }
  }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  getUsers: () => api.get('/api/auth/users'),
  getUser: (userId) => api.get(`/api/auth/users/${userId}`),
  getApiKey: (username) => api.post('/api/auth/api-key', { username }),
  debugConfig: (adminKey) => api.get(`/api/auth/debug/config?admin_key=${adminKey}`)
};

// Chat API - Use Kong gateway
export const chatAPI = {
  sendMessage: (messages, options = {}) => api.post('/api/chat/chat', {
    messages,
    stream: false,
    ...options
  }),
  sendStreamMessage: (messages, options = {}) => api.post('/api/chat/chat', {
    messages,
    stream: true,
    ...options
  }),
  getHistory: (userId) => api.get(`/api/chat/history/${userId}`),
  getConversations: () => api.get('/api/chat/conversations'),
  clearHistory: () => api.delete('/api/chat/history'),
  updateSystemPrompt: (prompt) => api.post('/api/chat/system-prompt', { prompt }),
  getSystemPrompt: () => api.get('/api/chat/system-prompt')
};

// Challenge API - Use Kong gateway
export const challengeAPI = {
  getChallenges: () => api.get('/api/challenges/challenges'),
  getChallenge: (challengeId) => api.get(`/api/challenges/challenges/${challengeId}`),
  submitChallenge: (submission) => api.post('/api/challenges/submit', submission),
  getLeaderboard: () => api.get('/api/challenges/leaderboard'),
  getUserProgress: (userId) => api.get(`/api/challenges/progress/${userId}`),
  validateSolution: (challengeId, solution) => api.post(`/api/challenges/validate/${challengeId}`, solution),
  getHint: (challengeId, level) => api.post(`/api/challenges/hint`, { challenge_id: challengeId, level })
};

// RAG API - Use Kong gateway
export const ragAPI = {
  ingest: (document) => api.post('/api/rag/ingest', document),
  search: (query) => api.post('/api/rag/search', { query }),
  getDocuments: () => api.get('/api/rag/documents'),
  deleteDocument: (docId) => api.delete(`/api/rag/documents/${docId}`),
  searchSimilar: (query, limit = 5) => api.post('/api/rag/search', { query, limit })
};

// Agent API - Use Kong gateway
export const agentAPI = {
  execute: (request) => api.post('/api/agent/execute', request),
  getTools: () => api.get('/api/agent/tools'),
  getExecutionHistory: () => api.get('/api/agent/history'),
  cancelExecution: (executionId) => api.post(`/api/agent/cancel/${executionId}`)
};

// Model Registry API - Use Kong gateway
export const modelAPI = {
  getModels: () => api.get('/api/models/models'),
  uploadModel: (modelData) => api.post('/api/models/upload', modelData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  downloadModel: (modelId) => api.get(`/api/models/download/${modelId}`),
  deleteModel: (modelId) => api.delete(`/api/models/${modelId}`),
  getModelInfo: (modelId) => api.get(`/api/models/${modelId}`)
};

// Health check endpoints
export const healthAPI = {
  checkAll: () => Promise.all([
    api.get('/api/auth/health').catch(() => ({ data: { status: 'down', service: 'auth' } })),
    api.get('/api/chat/health').catch(() => ({ data: { status: 'down', service: 'chat' } })),
    api.get('/api/rag/health').catch(() => ({ data: { status: 'down', service: 'rag' } })),
    api.get('/api/agent/health').catch(() => ({ data: { status: 'down', service: 'agent' } })),
    api.get('/api/models/health').catch(() => ({ data: { status: 'down', service: 'models' } })),
    api.get('/api/challenges/health').catch(() => ({ data: { status: 'down', service: 'challenges' } }))
  ])
};

export default api;
