import { create } from 'zustand';
import api from '../api';
import { connectSocket, disconnectSocket } from '../socket';

const useAuthStoreHook = create((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,

  fetchMe: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.get('/auth/me');
      set({ user: data.user, isAuthenticated: true, isLoading: false });

      const rooms = [];
      if (data.user.role === 'student') rooms.push(`student:${data.user._id}`);
      if (data.user.institutionId) rooms.push(`institution:${data.user.institutionId._id || data.user.institutionId}`);
      connectSocket(rooms);

      return data.user;
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post('/auth/login', { email, password });
      set({ user: data.user, isAuthenticated: true, isLoading: false });

      const rooms = [];
      if (data.user.role === 'student') rooms.push(`student:${data.user._id}`);
      if (data.user.institutionId) rooms.push(`institution:${data.user.institutionId._id || data.user.institutionId}`);
      connectSocket(rooms);

      return data.user;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (userData) => {
    try {
      set({ isLoading: true, error: null });
      const { data } = await api.post('/auth/register', userData);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data.user;
    } catch (err) {
      set({ error: err.response?.data?.error || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // continue logout even if server call fails
    }
    disconnectSocket();
    set({ user: null, isAuthenticated: false });
  },

  clearUser: () => {
    disconnectSocket();
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (updates) => {
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    }));
  },
}));
export default useAuthStoreHook;
