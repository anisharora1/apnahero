import { Router } from "express";
import { validateUser } from "../middleware/clerk.middleware.js";
import { deleteMessage, getMessages, getUnreadCount, markMessagesAsRead, sendMessage } from "../controllers/message.controller.js";

const router = Router()

//router.use(validateUser)

router.post('/',validateUser, sendMessage)
router.get('/unread-count', validateUser, getUnreadCount)
router.get('/:conversationId',validateUser, getMessages)
router.put('/:conversationId/mark-read',validateUser, markMessagesAsRead)
router.delete('/:messageId',validateUser, deleteMessage)

export default router