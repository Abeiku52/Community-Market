import { Router, Response } from 'express';
import moderationService from '../services/moderationService';
import listingService from '../services/listingService';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { ValidationError, validateRequired } from '../utils/validation';
import { ModerationAction } from '../models/Moderation';

const router = Router();

// Flag a listing (any user)
router.post('/flag', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { listingId, reason } = req.body;

    validateRequired(listingId, 'Listing ID');
    validateRequired(reason, 'Reason');

    // Check if listing exists
    const listing = await listingService.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Prevent flagging own listing
    if (listing.sellerId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot flag your own listing' });
    }

    const flag = await moderationService.createFlag({
      listingId,
      reporterId: req.user!.id,
      reason,
    });

    res.status(201).json({ flag, message: 'Listing flagged for review' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Flag listing error:', error);
      res.status(500).json({ error: 'Failed to flag listing' });
    }
  }
});

// Get flagged listings (admin only)
router.get('/flagged', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const flaggedListings = await moderationService.getFlaggedListings();

    res.json({ flaggedListings });
  } catch (error) {
    console.error('Get flagged listings error:', error);
    res.status(500).json({ error: 'Failed to retrieve flagged listings' });
  }
});

// Review flagged listing (admin only)
router.post('/review', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { flagId, action } = req.body;

    validateRequired(flagId, 'Flag ID');
    validateRequired(action, 'Action');

    // Validate action
    if (!Object.values(ModerationAction).includes(action)) {
      throw new ValidationError(
        `Invalid action. Must be one of: ${Object.values(ModerationAction).join(', ')}`
      );
    }

    await moderationService.reviewFlag(flagId, req.user!.id, action);

    res.json({ success: true, message: 'Flag reviewed successfully' });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Review flag error:', error);
      res.status(500).json({ error: 'Failed to review flag' });
    }
  }
});

// Suspend user (admin only)
router.post('/suspend-user', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, reason, durationDays } = req.body;

    validateRequired(userId, 'User ID');
    validateRequired(reason, 'Reason');
    validateRequired(durationDays, 'Duration');

    const duration = parseInt(durationDays);
    if (isNaN(duration) || duration <= 0) {
      throw new ValidationError('Duration must be a positive number of days');
    }

    // Prevent suspending self
    if (userId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot suspend yourself' });
    }

    const suspension = await moderationService.suspendUser({
      userId,
      adminId: req.user!.id,
      reason,
      durationDays: duration,
    });

    res.status(201).json({ suspension, message: 'User suspended successfully' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Suspend user error:', error);
      res.status(500).json({ error: 'Failed to suspend user' });
    }
  }
});

// Get user suspensions (admin only)
router.get('/suspensions/:userId', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const suspensions = await moderationService.getUserSuspensions(userId);

    res.json({ suspensions });
  } catch (error) {
    console.error('Get user suspensions error:', error);
    res.status(500).json({ error: 'Failed to retrieve user suspensions' });
  }
});

export default router;
