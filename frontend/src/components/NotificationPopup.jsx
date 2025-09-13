import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FaTimes, FaComment, FaUser } from 'react-icons/fa';

const NotificationPopup = ({ notification, onClose, onViewMessage }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (notification) {
            setIsVisible(true);
            // Auto-hide after 5 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300); // Wait for animation to complete
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [notification, onClose]);

    if (!notification || !isVisible) return null;

    const handleViewMessage = () => {
        onViewMessage(notification);
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
            <Card className="p-4 shadow-lg border-l-4 border-blue-500 bg-white max-w-sm hover:shadow-xl transition-shadow">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                        <FaComment />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                                New Message
                            </h4>
                            <button
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(onClose, 300);
                                }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimes size={12} />
                            </button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">
                                {notification.senderName || 'Someone'}
                            </span>
                            {' '}sent you a message
                        </p>
                        
                        {notification.serviceTitle && (
                            <p className="text-xs text-gray-500 mb-2">
                                About: {notification.serviceTitle}
                            </p>
                        )}
                        
                        <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded border-l-2 border-blue-200 mb-3">
                            "{notification.content}"
                        </p>
                        
                        <div className="flex gap-2">
                            <Button
                                onClick={handleViewMessage}
                                size="sm"
                                className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1"
                            >
                                View Message
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsVisible(false);
                                    setTimeout(onClose, 300);
                                }}
                                variant="outline"
                                size="sm"
                                className="text-xs px-3 py-1"
                            >
                                Dismiss
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default NotificationPopup;
