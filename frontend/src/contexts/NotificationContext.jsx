import React, { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    const addNotification = useCallback((notification) => {
        const newNotification = {
            ...notification,
            id: Date.now() + Math.random(), // Unique ID
            timestamp: new Date()
        };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto-remove notification after 5 seconds
        setTimeout(() => {
            removeNotification(newNotification.id);
        }, 5000);
    }, []);

    const removeNotification = useCallback((notificationId) => {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    }, []);

    const viewMessage = useCallback((notification) => {
        // Navigate to the conversation
        navigate(`/chat/${notification.conversationId}`, {
            state: {
                fromNotification: true
            }
        });
        
        // Remove the notification
        removeNotification(notification.id);
    }, [navigate, removeNotification]);

    const clearAllNotifications = useCallback(() => {
        setNotifications([]);
    }, []);

    const value = {
        notifications,
        addNotification,
        removeNotification,
        viewMessage,
        clearAllNotifications
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};
