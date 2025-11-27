import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // User state
  user: null,
  isAuthenticated: false,
  token: localStorage.getItem('token'),

  // Set user and auth
  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('token', token);
    }
    set({ user, isAuthenticated: !!user, token });
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false, token: null });
  },

  // Check auth
  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const { authAPI } = await import('../utils/api');
      const response = await authAPI.verify(token);
      const data = response.data;
      if (data.valid) {
        set({
          user: {
            username: data.user,
            role: data.role,
            user_id: data.user_id,
            email: data.email
          },
          isAuthenticated: true
        });
      } else {
        get().logout();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      get().logout();
    }
  },

  // Challenges state
  challenges: [],
  userProgress: {},

  setChallenges: (challenges) => set({ challenges }),
  setUserProgress: (progress) => set({ userProgress: progress }),

  // Score state
  score: 0,
  rank: null,

  setScore: (score) => set({ score }),
  setRank: (rank) => set({ rank }),
}));
