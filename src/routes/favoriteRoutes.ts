import express from 'express';
import FavoriteModel from '../models/Favorite';
import { authenticate, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = express.Router();

// Add listing to favorites
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId } = req.body;
    const userId = req.user!.id;

    if (!listingId) {
      return res.status(400).json({ error: 'Listing ID is required' });
    }

    const favorite = await FavoriteModel.addFavorite(userId, listingId);
    
    if (!favorite) {
      return res.status(200).json({ message: 'Already in favorites' });
    }

    res.status(201).json({ message: 'Added to favorites', favorite });
  } catch (error) {
    next(error);
  }
});

// Remove listing from favorites
router.delete('/:listingId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId } = req.params;
    const userId = req.user!.id;

    const removed = await FavoriteModel.removeFavorite(userId, listingId);

    if (!removed) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
});

// Get user's favorites
router.get('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const favorites = await FavoriteModel.getUserFavorites(userId);
    res.json(favorites);
  } catch (error) {
    next(error);
  }
});

// Check if listing is favorited
router.get('/check/:listingId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId } = req.params;
    const userId = req.user!.id;

    const isFavorited = await FavoriteModel.isFavorited(userId, listingId);
    res.json({ isFavorited });
  } catch (error) {
    next(error);
  }
});

export default router;
