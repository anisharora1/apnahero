import dotenv from 'dotenv'
import express from 'express'
import connectDB from './src/database/db.js'
import cors from 'cors'
import service from './src/routes/service.route.js'
import { clerkAuth } from './src/middleware/clerk.middleware.js'
import message from './src/routes/message.route.js'
import conversation from './src/routes/conversation.route.js'
import { createServer } from 'http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import Conversation from './src/models/conversation.models.js'
import Message from './src/models/message.model.js'
import path from 'path'
import helmet from 'helmet'

dotenv.config()
const app = express()
const port = process.env.PORT || 8000

//create http server for socket
const server = createServer(app)

// Configure Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      process.env.CORS_ORIGIN,
      'https://www.apnahero.in',
      'https://apnahero.in'
    ].filter(Boolean),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors({
  origin: [
    process.env.CORS_ORIGIN,
    'https://www.apnahero.in',
    'https://apnahero.in'
  ].filter(Boolean),
  credentials: true,
  optionsSuccessStatus: 200
}))

// Security headers including explicit Content-Security-Policy
app.use(helmet({
  crossOriginEmbedderPolicy: false
}))

app.use(helmet.contentSecurityPolicy({
  useDefaults: true,
  directives: {
    "default-src": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "manifest-src": ["'self'"],
    "img-src": [
      "'self'",
      'data:',
      'blob:',
      'http:',
      'https:',
      'https://apnahero.onrender.com',
      'https://res.cloudinary.com',
      'https://images.clerk.dev',
      'https://img.clerk.com',
      'https://*.clerk.com',
      'https://*.clerk.accounts.dev'
    ],
    "font-src": ["'self'", 'data:'],
    "style-src": ["'self'", "'unsafe-inline'"],
    "frame-src": [
      "'self'",
      'https://clerk.apnahero.in',
      'https://*.clerk.com',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.services'
    ],
    "connect-src": [
      "'self'",
      process.env.CORS_ORIGIN || '',
      process.env.VITE_API_URL || '',
      'https://clerk.apnahero.in',
      'https://img.clerk.com',
      'https://images.clerk.dev',
      'https://api.clerk.com',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.services',
      'https://clerk-telemetry.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'wss://*',
      'ws://*'
    ].filter(Boolean),
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      'https://cdn.jsdelivr.net',
      'https://clerk.apnahero.in',
      'https://*.clerk.com',
      'https://*.clerk.accounts.dev',
      'https://*.clerk.services',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ],
    "worker-src": ["'self'", 'blob:'],
    "object-src": ["'none'"]
  }
}))

const _dirname = path.resolve()

app.use(express.json({ limit: "10mb" }))

// Health check endpoint for keeping the server alive
app.get('/health', (_, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use(clerkAuth)


//routes
// API routes
app.use('/api/services', service)
app.use('/api/conversations', conversation)
app.use('/api/messages', message)

// Serve static files from the React app
app.use(express.static(path.join(_dirname, "/frontend/dist")))

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(_dirname, "/frontend/dist/index.html"))
})


const activeUsers = new Map()
const userConversations = new Map() // Track which conversations each user is currently in

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token
    if (!token) {
      return next(new Error('Authentication error'))
    }

    const decoded = jwt.decode(token)
    socket.userId = decoded?.sub || socket.handshake.auth.userId

    if (!socket.userId) {
      return next(new Error('Invalid user ID'))
    }
    next()
  } catch (error) {
    next(new Error('Authentication error'))
  }
})

// ✅ Socket.io connection
io.on("connection", (socket) => {
  //  console.log("⚡ New client connected:", socket.id, "User: ", socket.userId);

  activeUsers.set(socket.userId, socket.id)
  socket.join(`user:${socket.userId}`)

  // Initialize user conversations tracking
  if (!userConversations.has(socket.userId)) {
    userConversations.set(socket.userId, new Set())
  }

  socket.on("joinConversation", async ({ conversationId }) => {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
        $expr: { $eq: [{ $size: "$participants" }, 2] } // Only 1-on-1 conversations
      });

      if (!conversation) {
        socket.emit("error", { message: "Unauthorized access to conversation" });
        return;
      }

      socket.join(`conversation:${conversationId}`);

      // Track that this user is in this conversation
      userConversations.get(socket.userId).add(conversationId);

      console.log(`${socket.userId} joined conversation: ${conversationId}`);

      // Notify other participants that user is online
      socket.to(`conversation:${conversationId}`).emit("userOnline", {
        userId: socket.userId
      });

    } catch (error) {
      console.error("Error joining conversation:", error);
      socket.emit("error", { message: "Failed to join conversation" })
    }
  });

  // Leave conversation room
  socket.on("leaveConversation", ({ conversationId }) => {
    socket.leave(`conversation:${conversationId}`);

    // Remove from user conversations tracking
    if (userConversations.has(socket.userId)) {
      userConversations.get(socket.userId).delete(conversationId);
    }

    console.log(`${socket.userId} left conversation: ${conversationId}`);

    // Notify other participants that user went offline
    socket.to(`conversation:${conversationId}`).emit("userOffline", {
      userId: socket.userId
    });
  });

  // Mark messages as read
  socket.on("markAsRead", async ({ conversationId }) => {
    try {
      await Message.updateMany(
        {
          conversationId,
          senderId: { $ne: socket.userId },
          isRead: false
        },
        {
          isRead: true,
          readAt: new Date()
        }
      );

      // Notify other participants that messages were read
      socket.to(`conversation:${conversationId}`).emit("messagesRead", {
        conversationId,
        readBy: socket.userId
      });

    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    activeUsers.delete(socket.userId);
    userConversations.delete(socket.userId);
  });

  // Typing indicators
  socket.on("typing", async ({ conversationId, isTyping }) => {
    try {
      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: socket.userId,
        $expr: { $eq: [{ $size: "$participants" }, 2] }
      });

      if (conversation) {
        // Emit typing status only to this specific conversation room
        socket.to(`conversation:${conversationId}`).emit("userTyping", {
          userId: socket.userId,
          isTyping
        });
      }
    } catch (error) {
      console.error("❌ Error handling typing indicator:", error);
    }
  });

});

// Helper functions for user presence and notifications
const isUserOnline = (userId) => {
  return activeUsers.has(userId);
};

const isUserInConversation = (userId, conversationId) => {
  const userConvs = userConversations.get(userId);
  return userConvs && userConvs.has(conversationId);
};

const shouldShowNotification = (senderId, receiverId, conversationId) => {
  // Don't show notification if receiver is offline
  if (!isUserOnline(receiverId)) {
    return true; // Show notification for offline users
  }

  // Don't show notification if receiver is in the same conversation
  if (isUserInConversation(receiverId, conversationId)) {
    return false; // User is actively in this conversation
  }

  // Show notification if user is online but not in this conversation
  return true;
};

// Make io and helper functions available to routes
app.set('io', io);
app.set('isUserOnline', isUserOnline);
app.set('isUserInConversation', isUserInConversation);
app.set('shouldShowNotification', shouldShowNotification);

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  connectDB();
});
