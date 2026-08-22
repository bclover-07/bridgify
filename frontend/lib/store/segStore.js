import { create } from 'zustand';
import { getSocket } from '../socket';

const useSegStoreHook = create((set, get) => ({
  seg: null,
  isLoading: false,
  error: null,
  isSubscribed: false,

  fetchSeg: async () => {
    try {
      set({ isLoading: true });
      // In a real implementation this would fetch from /student/seg
      // Simulating a fetch for the UI to render correctly based on our mock data
      setTimeout(() => {
        set({ 
          seg: {
            readinessScore: 82,
            nodes: [
              { skillName: 'React.js', proficiencyScore: 92 },
              { skillName: 'Node.js', proficiencyScore: 85 },
              { skillName: 'System Design', proficiencyScore: 78 }
            ],
            edges: [
              { evidenceType: 'assessment', context: 'Passed Midterm React Quiz', scoreContributed: 15, timestamp: Date.now() - 86400000 },
              { evidenceType: 'project', context: 'Built full-stack e-commerce', scoreContributed: 25, timestamp: Date.now() - 172800000 }
            ]
          },
          isLoading: false
        });
      }, 500);
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
