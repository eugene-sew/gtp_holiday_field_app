import { create } from "zustand";
import { CheckSquare, AlertTriangle, Bell, Info } from "lucide-react";
import { Notification } from "../types/notification";
import React from "react";

interface NotificationState {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "read" | "timestamp" | "icon">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const getIconComponent = (
  type: string
): React.FC<React.SVGProps<SVGSVGElement>> => {
  switch (type) {
    case "task_assigned":
      return CheckSquare;
    case "deadline":
      return AlertTriangle;
    case "status_update":
      return Info;
    case "error":
      return AlertTriangle;
    default:
      return Bell;
  }
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      read: false,
      timestamp: new Date().toISOString(),
      icon: getIconComponent(notification.type),
      ...notification,
    };

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        read: true,
      })),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));
