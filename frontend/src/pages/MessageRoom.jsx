import { Card } from '@/components/ui/card'
import { useAuth, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FaArrowLeft } from "react-icons/fa6";

function MessageRoom() {
    const selectedService = useSelector(store => store.services.selectedService)
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [conversation, setConversation] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useUser()
    const { getToken } = useAuth();
    const { id: paramId } = useParams(); // Could be serviceId or conversationId
    const location = useLocation();
    const navigate = useNavigate();
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const [socketConnected, setSocketConnected] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState(null);

    const currentConversationRef = useRef(null);

    // Determine if this is from service page or chat list
    const isFromChatList = location.state?.conversation;
    const serviceData = location.state?.serviceData || selectedService;
    //console.log(serviceData)

    // Initialize socket connection
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
                forceNew: true // Force new connection
            });

            // Connection event
            socketRef.current.on("connect", () => {
                console.log("✅ Socket connected:", socketRef.current.id);
                setSocketConnected(true);

                // Join conversation if we have one
                if (currentConversationRef.current) {
                    socketRef.current.emit("joinConversation", {
                        conversationId: currentConversationRef.current._id
                    });
                }
            });

            // Disconnect event
            socketRef.current.on("disconnect", () => {
                console.log("❌ Socket disconnected");
                setSocketConnected(false);
            });

            // Message received event
            socketRef.current.on("receiveMessage", (msg) => {
                console.log("📨 Received message:", msg);
                setMessages((prev) => {
                    // Check if message already exists to prevent duplicates
                    const exists = prev.some(m => m._id === msg._id);
                    if (exists) return prev;

                    return [...prev, msg];
                });
                scrollToBottom();
            });

            // Listen for new message notifications
            socketRef.current.on("newMessageNotification", (notification) => {
                console.log("🔔 Received notification in MessageRoom:", notification);
                // Dispatch custom event for NotificationManager to catch
                window.dispatchEvent(new CustomEvent('newMessageNotification', {
                    detail: notification
                }));
            });

            // User online/offline events
            socketRef.current.on("userOnline", ({ userId }) => {
                console.log(`👤 User ${userId} came online`);
            });

            socketRef.current.on("userOffline", ({ userId }) => {
                console.log(`👤 User ${userId} went offline`);
            });

            // Typing indicator events
            socketRef.current.on("userTyping", ({ userId, isTyping: typing }) => {
                if (userId !== user.id) {
                    setIsTyping(typing);

                    // Clear typing after 3 seconds of inactivity
                    if (typing) {
                        setTimeout(() => setIsTyping(false), 3000);
                    }
                }
            });

            // Error handling
            socketRef.current.on("error", ({ message }) => {
                console.error("🚨 Socket error:", message);
            });

            socketRef.current.on("connect_error", (error) => {
                console.error("🚨 Socket connection error:", error);
                setSocketConnected(false);
            });

        } catch (error) {
            console.error("Failed to initialize socket:", error);
        }
    }, [user?.id, getToken]);

    // Handle conversation initialization
    useEffect(() => {
        if (!user?.id) return;

        const initConversation = async () => {
            try {
                setLoading(true);

                if (isFromChatList) {
                    // Coming from chat list - use existing conversation
                    const existingConversation = location.state.conversation;
                    setConversation(existingConversation);

                    currentConversationRef.current = existingConversation;
                    await fetchMessages(existingConversation._id);
                } else {
                    // Coming from service page - create new conversation or get existing
                    if (!serviceData) {
                        console.error("No service data available");
                        navigate(-1);
                        return;
                    }

                    const res = await axios.post(
                        `${import.meta.env.VITE_API_URL}/api/conversations`,
                        { serviceId: serviceData._id },
                        { withCredentials: true }
                    );

                    if (res.data.success) {
                        setConversation(res.data.conversation);
                        currentConversationRef.current = res.data.conversation;
                        await fetchMessages(res.data.conversation._id);
                    }
                }
            } catch (error) {
                console.error("Error initializing conversation:", error);
                if (error.response?.status === 400) {
                    alert("You cannot chat with yourself!");
                    navigate(-1);
                }
            } finally {
                setLoading(false);
            }
        };

        initConversation();
    }, [user?.id, isFromChatList, serviceData, paramId]);

    // Initialize socket after user is available
    useEffect(() => {
        if (user?.id) {
            initSocket();
        }

        return () => {
            if (socketRef.current) {
                console.log("🔌 Disconnecting socket...");
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocketConnected(false);
            }
        };
    }, [user?.id, initSocket]);

    // Join conversation when socket connects and conversation is ready
    useEffect(() => {
        if (socketConnected && conversation && socketRef.current) {
           // console.log("🚪 Joining conversation:", conversation._id);
            socketRef.current.emit("joinConversation", {
                conversationId: conversation._id
            });
        }
    }, [socketConnected, conversation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (socketRef.current && conversation) {
                socketRef.current.emit("leaveConversation", {
                    conversationId: conversation._id
                });
            }
        };
    }, [conversation]);


    // Fetch messages for conversation
    const fetchMessages = async (conversationId) => {
        try {
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/messages/${conversationId}`,
                {
                    params: { page: 1, limit: 50 },
                    withCredentials: true
                }
            );

            if (res.data.success) {
                setMessages(res.data.messages || []);

                // Mark messages as read
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/messages/${conversationId}/mark-read`,
                    {},
                    { withCredentials: true }
                );

                // Notify app to refresh unread counts globally
                window.dispatchEvent(new CustomEvent('messagesMarkedRead', {
                    detail: { conversationId }
                }));
            }
        } catch (error) {
            console.error("Error fetching messages:", error);
        }
    };

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Handle typing indicators
    const handleTyping = () => {
        if (socketRef.current && conversation) {
            socketRef.current.emit("typing", {
                conversationId: conversation._id,
                isTyping: true
            });

            // Clear previous timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }

            // Set new timeout to stop typing indicator
            const timeout = setTimeout(() => {
                socketRef.current.emit("typing", {
                    conversationId: conversation._id,
                    isTyping: false
                });
            }, 1000);

            setTypingTimeout(timeout);
        }
    };


    // Send message
    const handleSend = async () => {
        if (!newMessage.trim() || !conversation || !socketConnected) return;

        const messageContent = newMessage.trim()
        const tempId = Date.now().toString(); // Temporary ID for optimistic update

        // Optimistic update - add message immediately
        const optimisticMessage = {
            _id: tempId,
            conversationId: conversation._id,
            senderId: user.id,
            content: messageContent,
            messageType: 'text',
            isRead: false,
            createdAt: new Date().toISOString(),
            sending: true // Flag to show sending state
        };

        setMessages(prev => [...prev, optimisticMessage]);
        setNewMessage(""); // Clear input immediately
        scrollToBottom();

        const messageData = {
            conversationId: conversation._id,
            content: messageContent,
            messageType: 'text'
        };


        try {
            // Send via API
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/messages`,
                messageData,
                { withCredentials: true }
            );


            if (res.data.success) {
                // Remove optimistic message and let socket handle the real one
                setMessages(prev => prev.filter(msg => msg._id !== tempId));
               // console.log("✅ Message sent successfully");
            }
        } catch (error) {
            console.error("❌ Error sending message:", error);
            // Remove failed message and restore input
            setMessages(prev => prev.filter(msg => msg._id !== tempId));
            setNewMessage(messageContent);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault(); // Prevent form submission
            handleSend();
        }
    };

    // Handle input change with typing indicator
    const handleInputChange = (e) => {
        setNewMessage(e.target.value);
        handleTyping();
    };

    // Determine other user role
    const getOtherUserRole = () => {
        if (!conversation || !serviceData) return 'User';
        const isCurrentUserSeller = serviceData.clerkUserId === user.id;
        return isCurrentUserSeller ? 'Buyer' : 'Seller';
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-50'>
                <div className="flex flex-col items-center gap-3 text-gray-500">
                    <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-sm">Loading conversation...</span>
                </div>
            </div>
        );
    }

    return (
        <div className='flex flex-col h-screen bg-gray-50'>
            {/* Header */}
            <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
                    aria-label="Go back"
                >
                    <FaArrowLeft size={16} />
                </button>

                {conversation?.otherParticipantInfo?.imageUrl ? (
                    <img
                        src={conversation.otherParticipantInfo.imageUrl}
                        alt={conversation.otherParticipantInfo.firstName || 'User'}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                        {(conversation?.otherParticipantInfo?.firstName?.[0] || getOtherUserRole()[0]).toUpperCase()}
                    </div>
                )}

                <div className="flex-1 min-w-0">
                    <h1 className="text-base font-semibold text-gray-900 truncate">
                        {conversation?.otherParticipantInfo?.firstName || getOtherUserRole()}
                    </h1>
                    <p className="text-xs text-gray-400 truncate">
                        {serviceData?.title || 'Service Chat'}
                    </p>
                </div>


            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2"
                style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)' }}
            >
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-3xl">💬</div>
                        <p className="text-sm font-medium">No messages yet</p>
                        <p className="text-xs">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMine = msg.senderId === user.id;
                        return (
                            <div
                                key={msg._id}
                                className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[72%] md:max-w-[55%] ${isMine ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                                    <span className="text-[10px] text-gray-400 px-1">
                                        {isMine ? 'You' : (conversation?.otherParticipantInfo?.firstName || getOtherUserRole())}
                                    </span>
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            isMine
                                                ? 'bg-blue-500 text-white rounded-br-sm'
                                                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
                                        } ${msg.sending ? 'opacity-60' : ''}`}
                                    >
                                        {msg.content}
                                    </div>
                                    <span className={`text-[10px] px-1 ${isMine ? 'text-gray-400' : 'text-gray-400'}`}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {msg.sending && ' · Sending...'}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white border border-gray-100 shadow-sm px-4 py-2.5 rounded-2xl rounded-bl-sm flex items-center gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)] px-4 py-4">
                <div className="flex items-center gap-3 max-w-4xl mx-auto">
                    <input
                        type="text"
                        className="flex-1 bg-white border-2 border-gray-200 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-blue-400 transition-all placeholder:text-gray-400 shadow-sm disabled:opacity-50 disabled:bg-gray-50"
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder={socketConnected ? "Type a message..." : "Connecting..."}
                        disabled={!conversation || !socketConnected}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || !conversation || !socketConnected}
                        className="w-11 h-11 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white shadow-sm transition-all hover:scale-105 active:scale-95"
                        aria-label="Send message"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 translate-x-0.5">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default MessageRoom;