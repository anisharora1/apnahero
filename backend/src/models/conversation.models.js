import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    participants: [String],
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true
    },
    lastMessage: { type: String},
    lastMessageTime: { type: Date },
    isActive: { type: Boolean},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const Conversation= mongoose.model("Conversation", conversationSchema);
export default Conversation;