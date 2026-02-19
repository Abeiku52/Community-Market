import { Router, Response } from 'express';
import listingService from '../services/listingService';
import notificationService from '../services/notificationService';
import userService from '../services/userService';
import { authenticate, checkSuspension, AuthRequest } from '../middleware/auth';
import { ValidationError } from '../utils/validation';

const router = Router();

// Express interest in a listing
router.post('/:id/interest', authenticate, checkSuspension, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Check if listing exists
    const listing = await listingService.findById(id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Can't express interest in your own listing
    if (listing.sellerId === req.user!.id) {
      return res.status(400).json({ error: 'You cannot express interest in your own listing' });
    }

    // Check if already expressed interest
    const hasInterest = await listingService.hasUserExpressedInterest(id, req.user!.id);
    if (hasInterest) {
      return res.status(400).json({ error: 'You have already expressed interest in this listing' });
    }

    // Create interest
    const interest = await listingService.createInterest(id, req.user!.id, message);

    // Notify seller
    try {
      const interestedUser = await userService.findById(req.user!.id);
      if (interestedUser) {
        await notificationService.notifySellerOfInterest(id, listing, interestedUser);
      }
    } catch (notifError) {
      console.error('Failed to send interest notification:', notifError);
      // Don't fail the interest creation if notification fails
    }

    res.status(201).json({ interest, message: 'Interest expressed successfully' });
  } catch (error) {
    if (error instanceof Error && error.message === 'Interest already exists') {
      res.status(400).json({ error: 'You have already expressed interest in this listing' });
    } else {
      console.error('Express interest error:', error);
      res.status(500).json({ error: 'Failed to express interest' });
    }
  }
});

// Get interested users for a listing
router.get('/:id/interests', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if listing exists
    const listing = await listingService.findById(id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Get interests (anonymized if viewer is not the seller)
    const interests = await listingService.getListingInterests(id, req.user!.id);
    const count = await listingService.getInterestCount(id);

    res.json({ interests, count });
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ error: 'Failed to retrieve interests' });
  }
});

// Remove interest from a listing
router.delete('/:id/interest', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if listing exists
    const listing = await listingService.findById(id);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Remove interest
    const removed = await listingService.removeInterest(id, req.user!.id);

    if (!removed) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    res.json({ success: true, message: 'Interest removed successfully' });
  } catch (error) {
    console.error('Remove interest error:', error);
    res.status(500).json({ error: 'Failed to remove interest' });
  }
});

export default router;
