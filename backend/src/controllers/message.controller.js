import Conversation from "../models/conversation.models.js";
import Message from "../models/message.model.js";

const sendMessage = async (req, res) => {
    try {
        const { conversationId, content, messageType = 'text' } = req.body;
        const auth = req.auth();
        const senderId = auth?.userId;

        // Validate input
        if (!content || !content.trim()) {
            return res.status(400).json({ message: 'Message content cannot be empty' });
        }
        if (!conversationId) {
            return res.status(400).json({ message: 'Conversation ID is required' });
        }

        // FIXED: Ensure this is a 1-on-1 conversation and user is a participant
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: senderId,
            $expr: { $eq: [{ $size: "$participants" }, 2] } // Only 1-on-1 chats
        }).populate('serviceId', 'title clerkUserId')

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found or access denied" });
        }

        const message = await Message.create({
            conversationId,
            senderId,
            content: content.trim(),
            messageType,
            isRead: false,
        });

        // await message.save();
        conversation.lastMessage = content.substring(0, 50);
        conversation.lastMessageTime = new Date();
        await conversation.save();

        // const populatedMessage = await Message.findById(message._id)
        // Emit Socket.io event to conversation room
        const io = req.app.get('io');
        const shouldShowNotification = req.app.get('shouldShowNotification');
        
        if (io) {
            // Emit to all clients in the conversation room
            const messageData = {
                _id: message._id,
                conversationId,
                senderId,
                content: content.trim(),
                messageType,
                isRead: false,
                createdAt: message.createdAt
            };
           // console.log(`📤 Emitting message to room: conversation:${conversationId}`, messageData);

            io.to(`conversation:${conversationId}`).emit("receiveMessage", messageData);

            // Get the other participant for notification logic
            const otherParticipant = conversation.participants.find(p => p !== senderId);
            if (otherParticipant) {
                // Check if we should show notification based on user presence
                if (shouldShowNotification(senderId, otherParticipant, conversationId)) {
                    // Determine sender name based on role
                    const isSenderSeller = conversation.serviceId?.clerkUserId === senderId;
                    const senderName = isSenderSeller ? 'Seller' : 'Buyer';
                    
                    // Send notification to the other user's personal room
                    io.to(`user:${otherParticipant}`).emit("newMessageNotification", {
                        conversationId,
                        senderId,
                        senderName,
                        content: content.substring(0, 50),
                        serviceTitle: conversation.serviceId?.title,
                        messageId: message._id,
                        timestamp: message.createdAt
                    });
                    
                  //  console.log(`🔔 Notification sent to user ${otherParticipant} for message from ${senderName}`);
                } else {
                    console.log(`🔕 No notification sent - user ${otherParticipant} is in conversation ${conversationId}`);
                }
            }

        }


        res.status(200).json({
            success: true,
            message: message
        })
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

const getMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 50 } = req.query
        const auth = req.auth();
        const userId = auth?.userId;

        // FIXED: Ensure user is participant in this 1-on-1 conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
            $expr: { $eq: [{ $size: "$participants" }, 2] }
        })

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found or access denied" });
        }

        const skip = (page - 1) * limit
        const messages = await Message.find({
            conversationId
        }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));

        const totalMessages = await Message.countDocuments({ conversationId })

        res.status(200).json({
            success: true,
            messages: messages.reverse(),
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasMore: skip + messages.length < totalMessages
            }

        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
}

const markMessagesAsRead = async (req, res) => {
    try {
        const { conversationId } = req.params
        const auth = req.auth();
        const userId = auth?.userId;

        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
            $expr: { $eq: [{ $size: "$participants" }, 2] }
        })

        if (!conversation) {
            return res.status(404).json({ success: false, message: "Conversation not found or access denied" });
        }

        const result = await Message.updateMany(
            {
                conversationId,
                senderId: { $ne: userId },
                isRead: false
            },
            {
                isRead: true,
                readAt: new Date()
            }
        )

        // Emit read status to other participants
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation:${conversationId}`).emit("messagesRead", {
                conversationId,
                readBy: userId,
                readCount: result.modifiedCount
            });
        }


        res.status(200).json({
            success: true,
            message: `${result.modifiedCount} messages marked as read`
        })
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })

    }
}

const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params
        const auth = req.auth();
        const userId = auth?.userId;
        const message = await Message.findOne({
            _id: messageId,
            senderId: userId
        })
        if (!message) {
            return res.status(404).json({ success: false, message: "Conversation not found or Unauthorized" });
        }

        // FIXED: Verify the conversation is 1-on-1 before deleting
        const conversation = await Conversation.findOne({
            _id: message.conversationId,
            $expr: { $eq: [{ $size: "$participants" }, 2] }
        });

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: "Invalid conversation"
            });
        }

        await Message.findByIdAndDelete(messageId)

        const lastMessage = await Message.findOne({
            conversationId: message.conversationId
        }).sort({ createdAt: -1 })

        if (lastMessage) {
            await Conversation.findByIdAndUpdate(message.conversationId, {
                lastMessage: lastMessage.content.substring(0, 50),
                lastMessageTime: lastMessage.createdAt
            })
        } else {
            await Conversation.findByIdAndUpdate(message.conversationId, {
                lastMessage: '',
                lastMessageTime: new Date()
            })

        }

        // Emit delete event
        const io = req.app.get('io');
        if (io) {
            io.to(`conversation:${message.conversationId}`).emit("messageDeleted", {
                messageId,
                conversationId: message.conversationId
            });
        }

        res.status(200).json({
            success: true,
            message: 'Message deleted successfully'
        })


    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}

const getUnreadCount = async (req, res) => {
    try {
        const auth = req.auth();
        const userId = auth?.userId;

        // FIXED: Only count unread messages from 1-on-1 conversations
        const unreadCount = await Message.aggregate([
            {
                $lookup: {
                    from: 'conversations',
                    localField: 'conversationId',
                    foreignField: '_id',
                    as: 'conversation'
                }
            },
            {
                $match: {
                    'conversation.participants': userId,
                    'conversation.participants.1': { $exists: true }, // At least 2 participants
                    'conversation.participants.2': { $exists: false }, // But not more than 2
                    senderId: { $ne: userId },
                    isRead: false
                }
            },
            {
                $group: {
                    _id: '$conversationId',
                    count: { $sum: 1 }
                }
            }
        ])

        const totalUnread = unreadCount.reduce((sum, conv) => sum + conv.count, 0)

        res.status(200).json({
            success: true,
            totalUnread,
            conversationCounts: unreadCount
        })

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message })
    }
}
export { sendMessage, getMessages, markMessagesAsRead, deleteMessage, getUnreadCount };