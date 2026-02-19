import { Router, Response } from 'express';
import notificationService from '../services/notificationService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ValidationError } from '../utils/validation';

const router = Router();

// Get user's notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { unreadOnly } = req.query;

    const notifications = await notificationService.getUserNotifications(
      req.user!.id,
      unreadOnly === 'true'
    );

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
});

// Get unread notification count
router.get('/unread-count', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const count = await notificationService.getUnreadCount(req.user!.id);

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Failed to retrieve unread count' });
  }
});

// Mark notification as read
router.put('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const success = await notificationService.markAsRead(id, req.user!.id);

    if (!success) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Failed to mark notification as read' });
  }
});

// Mark all notifications as read
router.put('/mark-all-read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await notificationService.markAllAsRead(req.user!.id);

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
});

// Get notification preferences
router.get('/preferences', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const preferences = await notificationService.getPreferences(req.user!.id);

    res.json({ preferences });
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to retrieve notification preferences' });
  }
});

// Update notification preferences
router.put('/preferences', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const {
      emailNewMessage,
      emailListingInquiry,
      emailReviewReceived,
      emailDepartureReminder,
      inAppNewMessage,
      inAppListingInquiry,
      inAppReviewReceived,
      inAppDepartureReminder,
    } = req.body;

    const preferences = await notificationService.updatePreferences(req.user!.id, {
      emailNewMessage,
      emailListingInquiry,
      emailReviewReceived,
      emailDepartureReminder,
      inAppNewMessage,
      inAppListingInquiry,
      inAppReviewReceived,
      inAppDepartureReminder,
    });

    res.json({ preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

export default router;
