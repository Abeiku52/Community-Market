import { Router, Response } from 'express';
import transactionService from '../services/transactionService';
import listingService from '../services/listingService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ValidationError, validateRequired } from '../utils/validation';
import { ListingStatus } from '../models/Listing';

const router = Router();

// Create transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { listingId, sellerId } = req.body;

    validateRequired(listingId, 'Listing ID');
    validateRequired(sellerId, 'Seller ID');

    // Check if listing exists and is active
    const listing = await listingService.findById(listingId);
    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== ListingStatus.ACTIVE) {
      return res.status(400).json({ error: 'Listing is not available for transaction' });
    }

    // Verify seller ID matches listing seller
    if (listing.sellerId !== sellerId) {
      return res.status(400).json({ error: 'Invalid seller ID' });
    }

    // Prevent buying own listing
    if (listing.sellerId === req.user!.id) {
      return res.status(400).json({ error: 'Cannot create transaction for your own listing' });
    }

    // Check if transaction already exists for this listing
    const existingTransaction = await transactionService.findByListingId(listingId);
    if (existingTransaction) {
      return res.status(400).json({ error: 'Transaction already exists for this listing' });
    }

    const transaction = await transactionService.createTransaction({
      listingId,
      buyerId: req.user!.id,
      sellerId,
    });

    res.status(201).json({ transaction });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }
});

// Get transaction by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.findByIdWithDetails(id);

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Verify user is buyer or seller
    if (transaction.buyerId !== req.user!.id && transaction.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to view this transaction' });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to retrieve transaction' });
  }
});

// Complete transaction
router.put('/:id/complete', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.completeTransaction(id, req.user!.id);

    res.json({ transaction, message: 'Transaction completed successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Complete transaction error:', error);
      res.status(500).json({ error: 'Failed to complete transaction' });
    }
  }
});

// Cancel transaction
router.put('/:id/cancel', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const transaction = await transactionService.cancelTransaction(id, req.user!.id);

    res.json({ transaction, message: 'Transaction cancelled successfully' });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Cancel transaction error:', error);
      res.status(500).json({ error: 'Failed to cancel transaction' });
    }
  }
});

// Get user's transaction history
router.get('/history/all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const transactions = await transactionService.getUserTransactions(req.user!.id);

    res.json({ transactions });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({ error: 'Failed to retrieve transaction history' });
  }
});

export default router;
