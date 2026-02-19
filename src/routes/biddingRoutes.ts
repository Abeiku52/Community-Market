import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { biddingService } from '../services/biddingService';

const router = Router();

// Place a bid
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const { listingId, amount, isAnonymous, message } = req.body;
    const userId = (req as any).user.userId;

    if (!listingId || !amount) {
      return res.status(400).json({ error: 'Listing ID and amount are required' });
    }

    const bid = await biddingService.placeBid(
      listingId,
      userId,
      parseFloat(amount),
      isAnonymous || false,
      message
    );

    res.status(201).json({ bid });
  } catch (error: any) {
    console.error('Error placing bid:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get bids for a listing
router.get('/listings/:listingId', authenticate, async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const userId = (req as any).user.userId;

    const bids = await biddingService.getListingBids(listingId, userId);

    res.json({ bids });
  } catch (error: any) {
    console.error('Error getting listing bids:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get user's bids
router.get('/my-bids', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const bids = await biddingService.getUserBids(userId);

    res.json({ bids });
  } catch (error: any) {
    console.error('Error getting user bids:', error);
    res.status(400).json({ error: error.message });
  }
});

// Accept a bid
router.post('/:bidId/accept', authenticate, async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;
    const userId = (req as any).user.userId;

    await biddingService.acceptBid(bidId, userId);

    res.json({ message: 'Bid accepted successfully' });
  } catch (error: any) {
    console.error('Error accepting bid:', error);
    res.status(400).json({ error: error.message });
  }
});

// Reject a bid
router.post('/:bidId/reject', authenticate, async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;
    const userId = (req as any).user.userId;

    await biddingService.rejectBid(bidId, userId);

    res.json({ message: 'Bid rejected successfully' });
  } catch (error: any) {
    console.error('Error rejecting bid:', error);
    res.status(400).json({ error: error.message });
  }
});

// Withdraw a bid
router.delete('/:bidId', authenticate, async (req: Request, res: Response) => {
  try {
    const { bidId } = req.params;
    const userId = (req as any).user.userId;

    await biddingService.withdrawBid(bidId, userId);

    res.json({ message: 'Bid withdrawn successfully' });
  } catch (error: any) {
    console.error('Error withdrawing bid:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
