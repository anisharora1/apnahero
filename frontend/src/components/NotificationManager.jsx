import React, { useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNotification } from '../contexts/NotificationContext';
import NotificationPopup from './NotificationPopup';
import { playNotificationSound, requestNotificationPermission, showBrowserNotification } from '../utils/notificationSound';

const NotificationManager = () => {
    const { user } = useUser();
    const { notifications, addNotification, removeNotification, viewMessage } = useNotification();

    useEffect(() => {
        if (!user?.id) return;

        // Request notification permission on component mount
        requestNotificationPermission();

        // Create a global event listener for notifications
        const handleNotification = (event) => {
            const notification = event.detail;
            console.log("🔔 Received notification:", notification);
            
            // Add to notification context
            addNotification(notification);
            
            // Play sound
            playNotificationSound();
            
            // Show browser notification if permission granted
            showBrowserNotification(
                `New message from ${notification.senderName}`,
                {
                    body: notification.content,
                    tag: notification.conversationId, // Prevent duplicate notifications
                    data: notification
                }
            );
        };

        // Listen for custom notification events
        window.addEventListener('newMessageNotification', handleNotification);

        return () => {
            window.removeEventListener('newMessageNotification', handleNotification);
        };
    }, [user?.id, addNotification]);

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <NotificationPopup
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                    onViewMessage={viewMessage}
                />
            ))}
        </div>
    );
};

export default NotificationManager;
