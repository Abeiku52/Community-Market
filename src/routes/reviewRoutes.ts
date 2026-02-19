import { Router, Response } from 'express';
import reviewService from '../services/reviewService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ValidationError, validateRequired } from '../utils/validation';

const router = Router();

// Create review
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { transactionId, revieweeId, rating, comment } = req.body;

    validateRequired(transactionId, 'Transaction ID');
    validateRequired(revieweeId, 'Reviewee ID');
    validateRequired(rating, 'Rating');

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      throw new ValidationError('Rating must be a number between 1 and 5');
    }

    // Validate comment length if provided
    if (comment && comment.length > 500) {
      throw new ValidationError('Comment must be 500 characters or less');
    }

    const review = await reviewService.createReview({
      transactionId,
      reviewerId: req.user!.id,
      revieweeId,
      rating: ratingNum,
      comment,
    });

    res.status(201).json({ review, message: 'Review submitted successfully' });
  } catch (error) {
    if (error instanceof ValidationError || error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Create review error:', error);
      res.status(500).json({ error: 'Failed to create review' });
    }
  }
});

// Get user's reviews and rating
router.get('/users/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const userRating = await reviewService.getUserRating(id);

    res.json(userRating);
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ error: 'Failed to retrieve user reviews' });
  }
});

// Get review by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const review = await reviewService.findById(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ review });
  } catch (error) {
    console.error('Get review error:', error);
    res.status(500).json({ error: 'Failed to retrieve review' });
  }
});

export default router;
