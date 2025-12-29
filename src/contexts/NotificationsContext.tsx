import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Notification } from '../models';
import { NotificationService } from '../services/NotificationService';
import { toast } from 'sonner';

interface NotificationsContextType {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const fetchNotifications = async () => {
        if (!user?.id) return;

        setIsLoading(true);
        try {
            const data = await NotificationService.getUserNotifications(user.id);
            setNotifications(data);

            const count = await NotificationService.getUnreadCount(user.id);
            setUnreadCount(count);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchNotifications();

            // Subscribe to real-time updates
            const subscription = NotificationService.subscribeToNotifications(
                user.id,
                (newNotification) => {
                    setNotifications(prev => [newNotification, ...prev]);
                    setUnreadCount(prev => prev + 1);

                    // Show toast for new notification
                    toast(newNotification.title, {
                        description: newNotification.message,
                        action: newNotification.actionUrl ? {
                            label: 'View',
                            onClick: () => window.location.href = newNotification.actionUrl!
                        } : undefined
                    });
                }
            );

            return () => subscription.unsubscribe();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user?.id]);

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ) as Notification[]); // Cast needed because we're modifying readonly model prop in memory
            setUnreadCount(prev => Math.max(0, prev - 1));

            await NotificationService.markAsRead(id);
        } catch (error) {
            console.error('Failed to mark as read', error);
            fetchNotifications(); // Revert on error
        }
    };

    const markAllAsRead = async () => {
        if (!user?.id) return;
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })) as Notification[]);
            setUnreadCount(0);

            await NotificationService.markAllAsRead(user.id);
        } catch (error) {
            console.error('Failed to mark all as read', error);
            fetchNotifications();
        }
    };

    return (
        <NotificationsContext.Provider
            value={{
                notifications,
                unreadCount,
                isLoading,
                markAsRead,
                markAllAsRead,
                refreshNotifications: fetchNotifications
            }}
        >
            {children}
        </NotificationsContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationsProvider');
    }
    return context;
};
