import Conversation from "../models/conversation.models.js"
import Message from "../models/message.model.js"
import Service from "../models/service.model.js"
import { clerkClient } from "@clerk/express"

const createOrGetConversation = async (req, res) => {
    try {
        const { serviceId } = req.body
        const auth = req.auth()
        const buyerId = auth?.userId

        const service = await Service.findById(serviceId)
        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            })
        }
        const sellerId = service.clerkUserId

        if (buyerId === sellerId) {
            return res.status(400).json({
                message: 'Cannot start conversation with yourself'
            })
        }

        let conversation = await Conversation.findOne({
            serviceId,
            participants: { $all: [buyerId, sellerId], $size: 2 }
        }).populate('serviceId', 'title thumbnails')

        if (!conversation) {
            conversation = new Conversation({
                participants: [buyerId, sellerId],
                serviceId,
                lastMessage: '',
                lastMessageTime: new Date(),
                isActive: true
            })
            await conversation.save()
            await conversation.populate('serviceId', 'title thumbnails')

        }
        res.status(200).json({
            success: true,
            conversation
        })

    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        })
    }
}

const getUserConversations = async (req, res) => {
    try {
        const auth = req.auth()
        const userId = auth?.userId

        // FIXED: Only get conversations where user is a participant (max 2 people)
        const conversations = await Conversation.find({
            participants: userId,
            isActive: true,
            $expr: { $eq: [{ $size: "$participants" }, 2] } // Only 1-on-1 conversations
        }).populate('serviceId', 'title thumbnails clerkUserId').sort({ lastMessageTime: -1 })


        const conversationWithDetails = await Promise.all(
            conversations.map(async (conv) => {
                const unreadCount = await Message.countDocuments({
                    conversationId: conv._id,
                    senderId: { $ne: userId },
                    isRead: false
                })

                const otherParticipant = conv.participants.find(p => p !== userId)
                const isUserSeller = conv.serviceId.clerkUserId === userId

                let otherParticipantInfo = null
                try {
                    if (otherParticipant) {
                        const otherUser = await clerkClient.users.getUser(otherParticipant)
                        otherParticipantInfo = {
                            id: otherUser.id,
                            firstName: otherUser.firstName || '',
                            imageUrl: otherUser.imageUrl || ''
                        }
                    }
                } catch (e) {
                    console.error('Error fetching other participant info:', e?.message)
                }

                return {
                    ...conv.toObject(),
                    unreadCount,
                    otherParticipant,
                    otherParticipantInfo,
                    userRole: isUserSeller ? 'seller' : 'buyer'
                }
            })
        )
        res.status(200).json({
            success: true,
            conversations: conversationWithDetails
        })

    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        })
    }
}
const getConversation = async (req, res) => {
    try {
        const { conversationId } = req.params
        const auth = req.auth()
        const userId = auth?.userId

        // FIXED: Ensure only participants of this specific conversation can access it
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
            $expr: { $eq: [{ $size: "$participants" }, 2] } // Ensure it's 1-on-1
        }).populate('serviceId', 'title thumbnails clerkUserId')


        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            })
        }

        await Message.updateMany(
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
        // attach other participant info
        try {
            const otherParticipant = conversation.participants.find(p => p !== userId)
            if (otherParticipant) {
                const otherUser = await clerkClient.users.getUser(otherParticipant)
                const otherParticipantInfo = {
                    id: otherUser.id,
                    firstName: otherUser.firstName || '',
                    imageUrl: otherUser.imageUrl || ''
                }
                return res.status(200).json({
                    success: true,
                    conversation: { ...conversation.toObject(), otherParticipantInfo }
                })
            }
        } catch (e) {
            console.error('Error fetching other participant info:', e?.message)
        }

        res.status(200).json({ success: true, conversation })


    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        })
    }
}

const deleteConversation = async (req, res) => {
    try {
        const { conversationId } = req.params
        const auth = req.auth()
        const userId = auth?.userId
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId,
            $expr: { $eq: [{ $size: "$participants" }, 2] }
        })

        if (!conversation) {
            return res.status(404).json({
                success: false,
                message: 'Conversation not found'
            })
        }
        conversation.isActive = false
        await conversation.save()

        res.status(200).json({
            success: true,
            message: "Conversation deleted successfully"
        })


    } catch (error) {
        res.status(500).json({
            message: 'Server Error',
            error: error.message
        })
    }
}
export { createOrGetConversation, getUserConversations, getConversation, deleteConversation }