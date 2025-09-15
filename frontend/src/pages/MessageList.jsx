import { Card } from '@/components/ui/card'
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import VirtualScroll from '@/components/VirtualScroll';
import { useThrottle, useCache } from '@/hooks/performanceHooks';
import OptimizedImage from '@/components/OptimizedImage';
import LazyLoad from '@/components/LazyLoad';
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
            <div className="max-w-4xl mx-auto pt-10">
                <Card className="p-6">
                    <div className="text-center">Loading conversations...</div>
                </Card>
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
        <div className="max-w-4xl mx-auto pt-10">
            <Card className="p-6">
                <div className='flex gap-2'>
                    <Button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-100 bg-gray-900">
                        <FaArrowLeft className="mr-2" size={20} />
                    </Button>
                    <h1 className="text-2xl font-bold mb-6">Your Conversations</h1>
                </div>

                {conversationsWithMessages.length === 0 ? (
                    <div className="text-center py-10">
                        <FaComment className="mx-auto text-6xl text-gray-300 mb-4" />
                        <p className="text-gray-500">No conversations yet</p>
                        <p className="text-sm text-gray-400">
                            Conversations will appear here when buyers contact you
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {conversationsWithMessages.map((conversation) => (
                            <div
                                key={conversation._id}
                                onClick={() => openChat(conversation)}
                                className="flex items-center p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                {/* User Avatar */}
                                {conversation?.otherParticipantInfo?.imageUrl ? (
                                    <img
                                        src={conversation.otherParticipantInfo.imageUrl}
                                        alt={conversation.otherParticipantInfo.firstName || 'User'}
                                        className="w-12 h-12 rounded-full object-cover mr-4"
                                    />
                                ) : (
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white mr-4">
                                        <FaUser />
                                    </div>
                                )}

                                {/* Conversation Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">
                                                {conversation?.otherParticipantInfo?.firstName || (conversation.userRole === 'seller' ? 'Buyer' : 'Seller')}
                                            </h3>
                                            <p className="text-sm text-gray-600 truncate">
                                                About: {conversation.serviceId?.title}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">
                                                {conversation.lastMessageTime ? formatTime(conversation.lastMessageTime) : ''}
                                            </p>
                                            {conversation.unreadCount > 0 && (
                                                <div className="bg-green-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                                                    {conversation.unreadCount}
                                                </div>
                                            )}
                                            {/* <div className='absolute right-0 top-5'>
                                            <DropdownMenu>
                                            <DropdownMenuTrigger><BsThreeDotsVertical/></DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-[180px]">
                                                <DropdownMenuItem className="text-red-500" onClick={() => deleteConversation(conversation._id)}><Trash2 />Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                            </div> */}
                                        </div>
                                    </div>

                                    {/* Last Message Preview */}
                                    <p className="text-sm text-gray-500 mt-1 truncate">
                                        {conversation.lastMessage}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default MessageList;