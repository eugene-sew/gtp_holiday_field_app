import { create } from 'zustand';
import { CheckSquare, AlertTriangle, Bell, DivideIcon as LucideIcon } from 'lucide-react';
import { Notification } from '../types/notification';

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp' | 'icon'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const getIconComponent = (type: string): LucideIcon => {
  switch (type) {
    case 'task_assigned':
      return CheckSquare;
    case 'deadline':
      return AlertTriangle;
    default:
      return Bell;
  }
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [
    {
      id: '1',
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: 'You have been assigned a new task: "Site inspection at Project Alpha".',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      icon: CheckSquare,
    },
    {
      id: '2',
      type: 'deadline',
      title: 'Upcoming Deadline',
      message: 'The task "Equipment maintenance" is due tomorrow.',
      read: false,
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
      icon: AlertTriangle,
    },
  ],
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      read: false,
      timestamp: new Date().toISOString(),
      icon: getIconComponent(notification.type),
      ...notification,
    };
    
    set(state => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },
  
  markAsRead: (id: string) => {
    set(state => ({
      notifications: state.notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      ),
    }));
  },
  
  markAllAsRead: () => {
    set(state => ({
      notifications: state.notifications.map(notification => ({
        ...notification,
        read: true,
      })),
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [] });
  },
}));