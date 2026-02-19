import { Router, Response } from 'express';
import messageService from '../services/messageService';
import userService from '../services/userService';
import listingService from '../services/listingService';
import notificationService from '../services/notificationService';
import { NotificationType } from '../models/Notification';
import { authenticate, checkSuspension, AuthRequest } from '../middleware/auth';
import { ValidationError, validateRequired } from '../utils/validation';

const router = Router();

// Send message
router.post('/', authenticate, checkSuspension, async (req: AuthRequest, res: Response) => {
  try {
    const { listingId, recipientId, content } = req.body;

    // Validate required fields
    validateRequired(listingId, 'Listing ID');
    validateRequired(recipientId, 'Recipient ID');
    validateRequired(content, 'Message content');

    // Validate content length
    if (content.length > 1000) {
      throw new ValidationError('Message content must be 1000 characters or less');
    }

    // Check if listing exists
    const listing = await listingService.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Check if recipient exists
    const recipient = await userService.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: 'Recipient not found' });
    }

    // Check if recipient's email is verified
    if (!recipient.emailVerified) {
      return res.status(400).json({ error: 'Recipient has not verified their email' });
    }

    // Prevent sending message to self
    if (recipientId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot send message to yourself' });
    }

    const message = await messageService.createMessage({
      senderId: req.user!.id,
      recipientId,
      listingId,
      content,
    });

    // Send notification to recipient
    const sender = await userService.findById(req.user!.id);
    if (sender) {
      await notificationService.sendNotification(recipientId, NotificationType.NEW_MESSAGE, {
        listingId,
        listingTitle: listing.title,
        senderId: sender.id,
        senderName: sender.name,
        messagePreview: content.substring(0, 100),
      });
    }

    res.status(201).json({ message });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Send message error:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  }
});

// Get all conversations for user
router.get('/conversations', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await messageService.getUserConversations(req.user!.id);

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

// Get specific conversation
router.get(
  '/conversations/:listingId/:otherUserId',
  authenticate,
  async (req: AuthRequest, res: Response) => {
    try {
      const { listingId, otherUserId } = req.params;

      // Check if listing exists
      const listing = await listingService.findById(listingId);
      if (!listing) {
        return res.status(404).json({ error: 'Listing not found' });
      }

      // Check if other user exists
      const otherUser = await userService.findById(otherUserId);
      if (!otherUser) {
        return res.status(404).json({ error: 'User not found' });
      }

      const messages = await messageService.getConversation(req.user!.id, listingId, otherUserId);

      // Mark messages as read
      await messageService.markConversationAsRead(req.user!.id, listingId, otherUserId);

      res.json({ messages });
    } catch (error) {
      console.error('Get conversation error:', error);
      res.status(500).json({ error: 'Failed to retrieve conversation' });
    }
  }
);

// Mark message as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if message exists
    const message = await messageService.findById(id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is the recipient
    if (message.recipientId !== req.user!.id) {
      return res.status(403).json({ error: 'You can only mark your own messages as read' });
    }

    await messageService.markAsRead(id, req.user!.id);

    res.json({ success: true, message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark message as read' });
  }
});

// Get unread message count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const count = await messageService.getUnreadCount(req.user!.id);

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to retrieve unread count' });
  }
});

export default router;
