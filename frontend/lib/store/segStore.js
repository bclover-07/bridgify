import { create } from 'zustand';
import { getSocket } from '../socket';
import api from '../api';

const useSegStoreHook = create((set, get) => ({
  seg: null,
  isLoading: false,
  error: null,
  isSubscribed: false,

  fetchSeg: async () => {
    try {
      set({ isLoading: true });
      const { data } = await api.get('/student/seg');
      set({ 
        seg: {
          readinessScore: data.aggregate?.totalReadinessScore || 0,
          nodes: data.nodes || [],
          edges: data.edges || []
        },
        isLoading: false
      });
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  subscribe: () => {
    if (get().isSubscribed) return;
    const socket = getSocket();
    socket.on('seg:updated', (data) => {
      set((state) => ({ seg: { ...state.seg, ...data } }));
    });
    set({ isSubscribed: true });
  },

  unsubscribe: () => {
    const socket = getSocket();
    socket.off('seg:updated');
    set({ isSubscribed: false });
  },
}));

export default useSegStoreHook;
export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isSubscribed: false,

  subscribe: () => {
    if (get().isSubscribed) return;

    const socket = getSocket();
    socket.on('notification:new', (notification) => {
      set((state) => ({
        notifications: [notification, ...state.notifications],
        unreadCount: state.unreadCount + 1,
      }));
    });

    set({ isSubscribed: true });
  },

  setNotifications: (notifications) => {
    set({
      notifications,
      unreadCount: notifications.filter((n) => !n.isRead).length,
    });
  },

  markRead: (notificationId) => {
    const socket = getSocket();
    socket.emit('notification:mark-read', { notificationId });

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: (userId) => {
    const socket = getSocket();
    socket.emit('notification:mark-read', { userId });

    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));
