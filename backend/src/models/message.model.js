import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    senderId: {
        type: String,
        required: true
    },
    content:{
        type: String,
    },
    messageType: {
        type: String,
        enum: ["text"],
        default: "text"
    },
    isRead:{
        type: Boolean,
    },
    readAt:{
        type: Date,
    },
    createdAt:{
        type: Date,
    },
    updatedAt:{ type: Date, },

}, { timestamps: true });


const Message = mongoose.model("Message", messageSchema);
export default Message;