# Message Notification System

This document describes the implementation of the message notification system for the ApnaHero application.

## Features

### 1. Smart Notification Logic
- **Offline Users**: Notifications are shown when users are offline
- **Multiple Conversations**: When a seller is chatting with one buyer but receives a message from another buyer, a notification popup is shown
- **Active Conversation**: No notifications are shown when users are actively in the same conversation

### 2. Notification Types
- **Popup Notifications**: Custom in-app notification popups with message preview
- **Browser Notifications**: Native browser notifications (with user permission)
- **Sound Notifications**: Audio alerts for new messages

### 3. User Presence Tracking
- Tracks which users are online/offline
- Tracks which conversations each user is currently viewing
- Determines when to show notifications based on user presence

## Implementation Details

### Backend Components

#### 1. Socket.io Server (`backend/server.js`)
- Tracks active users and their current conversations
- Provides helper functions for notification logic
- Manages user presence and conversation state

#### 2. Message Controller (`backend/src/controllers/message.controller.js`)
- Enhanced to check user presence before sending notifications
- Determines sender role (Buyer/Seller) for notification display
- Sends notifications only when appropriate

### Frontend Components

#### 1. Notification Context (`frontend/src/contexts/NotificationContext.jsx`)
- Global state management for notifications
- Handles notification lifecycle (add, remove, view)
- Provides navigation to conversations

#### 2. Notification Manager (`frontend/src/components/NotificationManager.jsx`)
- Listens for notification events
- Manages browser notifications and sound alerts
- Renders notification popups

#### 3. Notification Popup (`frontend/src/components/NotificationPopup.jsx`)
- Displays message preview with sender name
- Shows service title and message content
- Provides actions to view message or dismiss

#### 4. Enhanced Message Components
- **MessageList**: Listens for notifications and refreshes conversation list
- **MessageRoom**: Dispatches notification events for other components

## Usage Scenarios

### Scenario 1: User is Offline
1. User A sends a message to User B
2. User B is offline
3. System shows notification popup to User B when they come online
4. Browser notification and sound alert are triggered

### Scenario 2: Seller Chatting with Multiple Buyers
1. Seller is actively chatting with Buyer A
2. Buyer B sends a message to the seller
3. System detects seller is in a different conversation
4. Notification popup appears with Buyer B's message
5. Seller can choose to view the message or continue current chat

### Scenario 3: User in Active Conversation
1. User A and User B are in the same conversation
2. User A sends a message
3. No notification popup is shown (user is already viewing the conversation)
4. Message appears directly in the chat

## Configuration

### Environment Variables
- `VITE_API_URL`: Backend API URL for socket connections

### Browser Permissions
- The system requests notification permission on first load
- Users can grant/deny browser notification permissions

## Technical Notes

### Socket Connection Management
- Each component maintains its own socket connection
- Custom events are used to communicate between components
- Proper cleanup prevents memory leaks

### Notification Deduplication
- Browser notifications use conversation ID as tag to prevent duplicates
- In-app notifications are managed by unique IDs

### Performance Considerations
- Notifications auto-dismiss after 5 seconds
- Socket connections are properly cleaned up
- Minimal re-renders through proper state management

## Testing the System

1. **Test Offline Notifications**:
   - Open two browser windows with different users
   - Close one window (simulate offline)
   - Send message from other window
   - Reopen window to see notification

2. **Test Multiple Conversations**:
   - Have a seller chat with Buyer A
   - In another window, have Buyer B send a message
   - Verify notification appears for seller

3. **Test Active Conversation**:
   - Have two users in the same conversation
   - Send messages between them
   - Verify no notifications appear

## Future Enhancements

- Push notifications for mobile devices
- Notification preferences/settings
- Message read receipts
- Typing indicators in notifications
- Rich media notifications (images, files)
