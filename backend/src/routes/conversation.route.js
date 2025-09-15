import { Router } from "express";
import { validateUser } from "../middleware/clerk.middleware.js";
import { createOrGetConversation, deleteConversation, getConversation, getUserConversations } from "../controllers/conversation.controller.js";

const router = Router()

router.use(validateUser)
router.post('/',createOrGetConversation)
router.get('/', getUserConversations)
router.get('/:conversationId',getConversation)
router.delete('/:conversationId', deleteConversation)

export default router