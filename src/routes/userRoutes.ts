import { Router, Response } from 'express';
import listingService from '../services/listingService';
import userService from '../services/userService';
import reviewService from '../services/reviewService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { ValidationError } from '../utils/validation';

const router = Router();

// Get current user's profile
router.get('/profile/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await userService.findById(req.user!.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        schoolAffiliation: user.schoolAffiliation,
        departureDate: user.departureDate,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get current user profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { name, schoolAffiliation, departureDate } = req.body;

    const updateData: any = {};

    if (name !== undefined) {
      if (name.trim().length === 0) {
        throw new ValidationError('Name cannot be empty');
      }
      updateData.name = name;
    }

    if (schoolAffiliation !== undefined) {
      if (schoolAffiliation.trim().length === 0) {
        throw new ValidationError('School affiliation cannot be empty');
      }
      updateData.schoolAffiliation = schoolAffiliation;
    }

    if (departureDate !== undefined) {
      if (departureDate === null) {
        updateData.departureDate = null;
      } else {
        const date = new Date(departureDate);
        if (isNaN(date.getTime())) {
          throw new ValidationError('Invalid departure date');
        }
        // Validate date is in the future
        if (date < new Date()) {
          throw new ValidationError('Departure date must be in the future');
        }
        updateData.departureDate = date;
      }
    }

    const user = await userService.updateUser(req.user!.id, updateData);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        schoolAffiliation: user.schoolAffiliation,
        departureDate: user.departureDate,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  }
});

// Get user profile with listings and reviews
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await userService.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's listings
    const listings = await listingService.findBySellerId(id);

    // Get user's reviews and rating
    const userRating = await reviewService.getUserRating(id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        schoolAffiliation: user.schoolAffiliation,
        departureDate: user.departureDate,
        createdAt: user.createdAt,
      },
      listings,
      averageRating: userRating.averageRating,
      totalReviews: userRating.totalReviews,
      reviews: userRating.reviews,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve user profile' });
  }
});

// Get user's listings
router.get('/:id/listings', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await userService.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const listings = await listingService.findBySellerIdWithPhotos(id);

    res.json({ listings });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({ error: 'Failed to retrieve user listings' });
  }
});

export default router;
