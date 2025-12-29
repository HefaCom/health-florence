
import React from 'react';
import { Bell, Check } from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationsContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { NotificationType } from '../../services/NotificationService';

export const NotificationsDropdown = () => {
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();
    const { user } = useAuth();
    const [open, setOpen] = React.useState(false);

    // Helper to get icon/color based on type
    const getTypeStyles = (type: string) => {
        switch (type) {
            case NotificationType.APPOINTMENT:
                return 'bg-blue-100 text-blue-600';
            case NotificationType.WALLET:
            case NotificationType.DIETARY:
            case NotificationType.GOAL:
                return 'bg-green-100 text-green-600';
            case NotificationType.SYSTEM:
            default:
                return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-gray-400 hover:text-[#2C3E50]">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-red-500 border-2 border-white animate-pulse" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-600 h-auto py-1"
                            onClick={() => markAllAsRead()}
                        >
                            Mark all read
                        </Button>
                    )}

                    {/* <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-purple-600 h-auto py-1 ml-2"
                        onClick={async () => {
                            console.log('Testing notification creation...');
                            try {
                                if (!user?.id) {
                                    console.error('No user ID found for test notification');
                                    return;
                                }
                                const { NotificationService, NotificationType } = await import('../../services/NotificationService');
                                await NotificationService.createNotification(
                                    user.id,
                                    NotificationType.SYSTEM,
                                    'Test Notification',
                                    'This is a manually triggered test notification.'
                                );
                                console.log('Test notification sent to:', user.id);
                            } catch (e) {
                                console.error('Test notification failed:', e);
                            }
                        }}
                    >
                        Test
                    </Button> */}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading && notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-gray-500">Loading...</div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer flex gap-3",
                                        !notification.isRead && "bg-blue-50/50 dark:bg-blue-900/20"
                                    )}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        if (notification.actionUrl) {
                                            window.location.href = notification.actionUrl;
                                        }
                                    }}
                                >
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notification.isRead ? 'bg-blue-500 dark:bg-blue-400' : 'bg-transparent'}`} />
                                    <div className="flex-1 space-y-1">
                                        <p className={cn("text-sm font-medium leading-none", !notification.isRead && "text-blue-700 dark:text-blue-300")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-gray-400">
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-sm text-gray-500">
                            No notifications yet
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
};
