import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NOTIFICATIONS_STORAGE_KEY = 'skillvault_notifications';
const NOTIFICATIONS_VERSION_KEY = 'skillvault_notifications_version';
const NOTIFICATIONS_DATA_VERSION = 1;

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(() => {
    try {
      const storedVersion = localStorage.getItem(NOTIFICATIONS_VERSION_KEY);
      if (storedVersion !== String(NOTIFICATIONS_DATA_VERSION)) {
        localStorage.removeItem(NOTIFICATIONS_STORAGE_KEY);
        localStorage.setItem(NOTIFICATIONS_VERSION_KEY, String(NOTIFICATIONS_DATA_VERSION));
        return [];
      }
      const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
      localStorage.setItem(NOTIFICATIONS_VERSION_KEY, String(NOTIFICATIONS_DATA_VERSION));
    } catch {
      // Storage unavailable or quota exceeded
    }
  }, [notifications]);

  /**
   * Push a new notification for a student
   */
  const addNotification = useCallback(({ studentEmail, type, title, message, activityId }) => {
    const newNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      studentEmail: studentEmail?.trim().toLowerCase() || '',
      type, // 'approved' | 'rejected'
      title,
      message,
      activityId: activityId || null,
      createdAt: new Date().toISOString(),
      read: false
    };

    setNotifications((prev) => [newNotification, ...prev]);
    return newNotification;
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback((studentEmail) => {
    const emailNorm = studentEmail?.trim().toLowerCase();
    setNotifications((prev) =>
      prev.map((n) =>
        !emailNorm || n.studentEmail === emailNorm ? { ...n, read: true } : n
      )
    );
  }, []);

  const getNotificationsForStudent = useCallback(
    (studentEmail) => {
      const emailNorm = studentEmail?.trim().toLowerCase();
      return notifications.filter((n) => n.studentEmail === emailNorm);
    },
    [notifications]
  );

  const getUnreadCount = useCallback(
    (studentEmail) => {
      const emailNorm = studentEmail?.trim().toLowerCase();
      return notifications.filter((n) => n.studentEmail === emailNorm && !n.read).length;
    },
    [notifications]
  );

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        getNotificationsForStudent,
        getUnreadCount
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components, react/only-export-components
export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
