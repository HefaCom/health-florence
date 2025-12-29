
import { generateClient } from 'aws-amplify/api';
import { Notification, ModelSortDirection } from '../API';
import { userService } from './user.service';

const client = generateClient();

export enum NotificationType {
    APPOINTMENT = 'APPOINTMENT',
    WALLET = 'WALLET',
    PROFILE = 'PROFILE',
    SYSTEM = 'SYSTEM',
    DIETARY = 'DIETARY',
    GOAL = 'GOAL',
    EXPERT = 'EXPERT'
}

export const NotificationService = {
    /**
     * Create a new notification for a user
     */
    async createNotification(
        userId: string,
        type: string | NotificationType,
        title: string,
        message: string,
        data?: object,
        actionUrl?: string
    ): Promise<Notification> {
        try {
            const input = {
                userId,
                type: type as string,
                title,
                message,
                data: data ? JSON.stringify(data) : undefined,
                isRead: false,
                actionUrl
            };

            // Using manual string to exclude 'user' field which causes non-nullable errors
            const result = await client.graphql({
                query: `
                    mutation CreateNotification($input: CreateNotificationInput!) {
                        createNotification(input: $input) {
                            id
                            userId
                            type
                            title
                            message
                            data
                            isRead
                            actionUrl
                            createdAt
                            updatedAt
                        }
                    }
                `,
                variables: { input }
            });

            return (result as any).data.createNotification;
        } catch (error: any) {
            console.error('Error creating notification via API:', JSON.stringify(error, null, 2));
            if (error.errors) {
                console.error('GraphQL Errors:', JSON.stringify(error.errors, null, 2));
            }
            throw error;
        }
    },

    /**
     * Notify all admins
     */
    async notifyAdmins(
        type: string | NotificationType,
        title: string,
        message: string,
        data?: object,
        actionUrl?: string
    ): Promise<void> {
        try {
            const admins = await userService.getUsersByRole('admin');
            console.log(`Sending notification to ${admins.length} admins`);

            await Promise.all(
                admins.map(admin =>
                    this.createNotification(
                        admin.id,
                        type,
                        title,
                        message,
                        data,
                        actionUrl
                    )
                )
            );
        } catch (error) {
            console.error('Error notifying admins:', error);
        }
    },

    /**
     * Get all notifications for a user, sorted by date (newest first)
     */
    async getUserNotifications(userId: string, limit: number = 20): Promise<Notification[]> {
        try {
            const result = await client.graphql({
                query: `
                    query ListNotificationsByUser($userId: ID!, $sortDirection: ModelSortDirection, $limit: Int) {
                        listNotificationsByUser(userId: $userId, sortDirection: $sortDirection, limit: $limit) {
                            items {
                                id
                                userId
                                type
                                title
                                message
                                data
                                isRead
                                actionUrl
                                createdAt
                                updatedAt
                            }
                        }
                    }
                `,
                variables: {
                    userId,
                    sortDirection: "DESC" as ModelSortDirection,
                    limit
                }
            });

            return (result as any).data.listNotificationsByUser.items;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }
    },

    /**
     * Get unread notifications count
     */
    async getUnreadCount(userId: string): Promise<number> {
        try {
            // We'll fetch unread notifications directly using a filter
            const result = await client.graphql({
                query: `
                    query ListNotificationsByUser($userId: ID!, $filter: ModelNotificationFilterInput) {
                        listNotificationsByUser(userId: $userId, filter: $filter) {
                            items {
                                id
                            }
                        }
                    }
                `,
                variables: {
                    userId,
                    filter: { isRead: { eq: false } }
                }
            });
            return (result as any).data.listNotificationsByUser.items.length;
        } catch (error) {
            console.error('Error fetching unread count:', error);
            return 0;
        }
    },

    /**
     * Mark a notification as read
     */
    async markAsRead(notificationId: string): Promise<Notification | undefined> {
        try {
            const result = await client.graphql({
                query: `
                    mutation UpdateNotification($input: UpdateNotificationInput!) {
                        updateNotification(input: $input) {
                            id
                            isRead
                            updatedAt
                        }
                    }
                `,
                variables: {
                    input: {
                        id: notificationId,
                        isRead: true
                    }
                }
            });
            return (result as any).data.updateNotification;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    },

    /**
     * Mark all notifications as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        try {
            // First get all unread notifications
            const unread = await this.getUserNotifications(userId, 100);
            const unreadIds = unread.filter(n => !n.isRead).map(n => n.id);

            await Promise.all(
                unreadIds.map((id) =>
                    client.graphql({
                        query: `
                            mutation UpdateNotification($input: UpdateNotificationInput!) {
                                updateNotification(input: $input) {
                                    id
                                    isRead
                                }
                            }
                        `,
                        variables: {
                            input: {
                                id: id,
                                isRead: true
                            }
                        }
                    })
                )
            );
        } catch (error) {
            console.error('Error marking all as read:', error);
            throw error;
        }
    },

    /**
     * Subscribe to new notifications for a user
     */
    subscribeToNotifications(userId: string, onNext: (notification: Notification) => void) {
        // Use standard GraphQL subscription
        // Cast client.graphql to any to bypass TS error with Observable return type
        const observable = client.graphql({
            query: `
                subscription OnCreateNotification($filter: ModelSubscriptionNotificationFilterInput) {
                    onCreateNotification(filter: $filter) {
                        id
                        userId
                        type
                        title
                        message
                        data
                        isRead
                        actionUrl
                        createdAt
                        updatedAt
                    }
                }
            `,
            variables: {
                filter: { userId: { eq: userId } }
            }
        }) as any;

        const subscription = observable.subscribe({
            next: ({ data }: any) => {
                if (data?.onCreateNotification) {
                    onNext(data.onCreateNotification);
                }
            },
            error: (error: any) => console.error('Notification subscription error:', error)
        });

        return subscription;
    }
};
