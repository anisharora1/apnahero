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
            <div className='max-h-screen md:max-w-4xl mx-auto pt-10'>
                <Card className='p-4'>
                    <div className="text-center">Loading conversation...</div>
                </Card>
            </div>
        );
    }

    return (
        <div className='max-h-screen md:max-w-4xl mx-auto pt-10'>
            <Card className='p-4'>
                <div className='items-center mb-4 flex'>
                    <button onClick={() => navigate(-1)} className="flex items-center text-sm text-gray-600 mr-4">
                        <FaArrowLeft className="mr-2" size={20} />
                    </button>
                    {/* Avatar + Name */}
                    {conversation?.otherParticipantInfo?.imageUrl ? (
                        <img
                            src={conversation.otherParticipantInfo.imageUrl}
                            alt={conversation.otherParticipantInfo.firstName || 'User'}
                            className="w-10 h-10 rounded-full object-cover mr-3"
                        />
                    ) : null}
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">
                            {conversation?.otherParticipantInfo?.firstName || getOtherUserRole()} • {serviceData?.title}
                        </h1>
                        <p className="text-sm text-gray-600">
                            Chatting with {conversation?.otherParticipantInfo?.firstName || getOtherUserRole()}
                        </p>
                    </div>
                </div>

                {/* Messages Box */}
                <div className="border border-gray-300 rounded-lg p-4 h-96 overflow-y-auto mb-4">
                    <div className="flex flex-col space-y-4">
                        {messages.length === 0 ? (
                            <div className="text-center text-gray-500 mt-10">
                                No messages yet. Start the conversation!
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`p-3 rounded-lg max-w-[70%] ${msg.senderId === user.id
                                        ? "bg-blue-500 text-white ml-auto"
                                        : "bg-gray-200 text-gray-800 mr-auto"
                                        } ${msg.sending ? 'opacity-60' : ''}`}
                                >
                                    <p className="text-xs opacity-75 mb-1">
                                        {msg.senderId === user.id ? "You" : getOtherUserRole()}
                                    </p>
                                    <p>{msg.content}</p>
                                    <p className="text-xs opacity-75 mt-1">
                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                        {msg.sending && " • Sending..."}
                                    </p>
                                </div>
                            ))
                        )}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className=" text-sm  text-gray-500 italic">
                                {getOtherUserRole()} is typing...
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Input Box */}
                <div className="flex w-full gap-2">
                    <input
                        type="text"
                        className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={newMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Type a message..."
                        disabled={!conversation || !socketConnected}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || !conversation || !socketConnected}
                        className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Send
                    </button>
                </div>
            </Card>
        </div>
    );
}

export default MessageRoom;