import { Card } from '@/components/ui/card'
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom';
import { FaUser, FaComment } from "react-icons/fa";
import { Button } from '@/components/ui/button';
import { FaArrowLeft } from 'react-icons/fa6';
import { io } from 'socket.io-client';


function MessageList() {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const socketRef = useRef(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    // Listen for global events to refresh list without hard reload
    useEffect(() => {
        const refresh = () => fetchConversations();
        window.addEventListener('newMessageNotification', refresh);
        window.addEventListener('messagesMarkedRead', refresh);
        return () => {
            window.removeEventListener('newMessageNotification', refresh);
            window.removeEventListener('messagesMarkedRead', refresh);
        }
    }, []);

    // Initialize socket for notifications
    const initSocket = useCallback(async () => {
        if (socketRef.current?.connected) {
            return; // Already connected
        }

        try {
            const token = await getToken();

            socketRef.current = io(import.meta.env.VITE_API_URL, {
                withCredentials: true,
                auth: {
                    token: token,
                    userId: user?.id
                },
                forceNew: true
            });

            socketRef.current.on("connect", () => {
                console.log("✅ MessageList socket connected:", socketRef.current.id);
            });

            socketRef.current.on("disconnect", () => {
                console.log("❌ MessageList socket disconnected");
            });

            // Listen for new message notifications
            socketRef.current.on("newMessageNotification", (notification) => {
                console.log("🔔 Received notification in MessageList:", notification);
                // Dispatch custom event for NotificationManager to catch
                window.dispatchEvent(new CustomEvent('newMessageNotification', {
                    detail: notification
                }));
                
                // Refresh conversations to show updated unread counts
                fetchConversations();
            });

        } catch (error) {
            console.error("Failed to initialize MessageList socket:", error);
        }
    }, [user?.id, getToken]);

    // Initialize socket after user is available
    useEffect(() => {
        if (user?.id) {
            initSocket();
        }

        return () => {
            if (socketRef.current) {
                console.log("🔌 Disconnecting MessageList socket...");
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [user?.id, initSocket]);

    const fetchConversations = async () => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/conversations`,
                { withCredentials: true }
            );

            if (res.data.success) {
                setConversations(res.data.conversations || []);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        } finally {
            setLoading(false);
        }
    };

    const openChat = (conversation) => {
        // Navigate to message room with conversation data
        navigate(`/chat/${conversation._id}`, {
            state: {
                conversation,
                serviceData: conversation.serviceId
            }
        });
    };

    const formatTime = (date) => {
        const now = new Date();
        const messageDate = new Date(date);
        const diffInHours = (now - messageDate) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Just now';
        } else if (diffInHours < 24) {
            return `${Math.floor(diffInHours)}h ago`;
        } else {
            return messageDate.toLocaleDateString();
        }
    };

    const conversationsWithMessages = React.useMemo(() => {
        const hasMessage = (c) => {
            const text = typeof c.lastMessage === 'string' ? c.lastMessage.trim() : '';
            return text.length > 0;
        };
        return (conversations || [])
            .filter(hasMessage)
            .sort((a, b) => new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0));
    }, [conversations]);

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto px-4 pt-10 pb-24">
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                    <div className="text-center text-gray-500">Loading conversations...</div>
                </div>
            </div>
        );
    }

    // const deleteConversation = async (id) => {
    //     try {
    //         alert("Are you sure you want to delete this conversation?")
    //         const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/conversations/${id}`, { withCredentials: true });
    //         if (res.data.success) {
    //             fetchConversations();
    //             alert("Conversation deleted successfully")
    //         }
    //     } catch (error) {
    //         console.error("Error deleting conversation:", error);
    //         alert("Failed to delete conversation")
    //     }
    // }

    return (
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-24 min-h-screen">
            {/* Header */}
            <div className='flex items-center gap-4 mb-8'>
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-sm"
                    aria-label='Go back'
                >
                    <FaArrowLeft size={16} />
                </button>
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Your Conversations</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your messages with buyers and sellers</p>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
                {conversationsWithMessages.length === 0 ? (
                    <div className="text-center py-16 px-4">
                        <FaComment className="mx-auto text-5xl text-gray-200 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No conversations yet</h3>
                        <p className="text-sm text-gray-500 max-w-sm mx-auto">
                            Messages will appear here when you contact sellers or buyers message you.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {conversationsWithMessages.map((conversation) => (
                            <div
                                key={conversation._id}
                                onClick={() => openChat(conversation)}
                                className="flex items-center p-4 md:p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                {/* User Avatar */}
                                {conversation?.otherParticipantInfo?.imageUrl ? (
                                    <img
                                        src={conversation.otherParticipantInfo.imageUrl}
                                        alt={conversation.otherParticipantInfo.firstName || 'User'}
                                        className="w-12 h-12 md:w-14 md:h-14 rounded-full object-cover mr-4 shadow-sm border border-gray-100"
                                    />
                                ) : (
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center text-gray-400 mr-4">
                                        <FaUser size={20} />
                                    </div>
                                )}

                                {/* Conversation Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-base">
                                               {conversation?.otherParticipantInfo?.firstName || (conversation.userRole === 'seller' ? 'Buyer' : 'Seller')}
                                            </h3>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <p className="text-xs font-medium text-gray-400">
                                                {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <p className="text-xs text-gray-500 mb-1 truncate">
                                        Regarding: <span className="font-medium text-gray-700">{conversation.serviceId?.title}</span>
                                    </p>

                                    {/* Last Message Preview & Unread Badge */}
                                    <div className="flex items-center justify-between">
                                        <p className={`text-sm truncate pr-4 ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                            {conversation.lastMessage}
                                        </p>
                                        {conversation.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold rounded-full px-2 py-0.5 min-w-[20px] text-center">
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default MessageList;