import { Router, Response } from 'express';
import listingService from '../services/listingService';
import notificationService from '../services/notificationService';
import userService from '../services/userService';
import { authenticate, checkSuspension, AuthRequest } from '../middleware/auth';
import { ValidationError, validateRequired } from '../utils/validation';
import { ListingCategory, ListingCondition } from '../models/Listing';

const router = Router();

// Search/browse listings (must be before /:id route)
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { category, minPrice, maxPrice, search, leavingSoon } = req.query;

    const filters: any = {};

    if (category) {
      if (!Object.values(ListingCategory).includes(category as ListingCategory)) {
        return res.status(400).json({
          error: `Invalid category. Must be one of: ${Object.values(ListingCategory).join(', ')}`,
        });
      }
      filters.category = category;
    }

    if (minPrice) {
      const min = parseFloat(minPrice as string);
      if (isNaN(min) || min < 0) {
        return res.status(400).json({ error: 'Invalid minPrice' });
      }
      filters.minPrice = min;
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice as string);
      if (isNaN(max) || max < 0) {
        return res.status(400).json({ error: 'Invalid maxPrice' });
      }
      filters.maxPrice = max;
    }

    if (search) {
      filters.search = search as string;
    }

    if (leavingSoon === 'true') {
      filters.leavingSoon = true;
    }

    // Add domain filtering - get from Authorization header if present
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        const userDomain = decoded.email.split('@')[1];
        filters.userDomain = userDomain;
      } catch (err) {
        // If token is invalid, just don't filter by domain
        console.log('Invalid token, showing all listings');
      }
    }

    const listings = await listingService.searchListings(filters);

    res.json({ listings });
  } catch (error) {
    console.error('Search listings error:', error);
    res.status(500).json({ error: 'Failed to search listings' });
  }
});

// Create listing
router.post('/', authenticate, checkSuspension, async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, price, category, condition } = req.body;

    // Validate required fields
    validateRequired(title, 'Title');
    validateRequired(description, 'Description');
    validateRequired(price, 'Price');
    validateRequired(category, 'Category');
    validateRequired(condition, 'Condition');

    // Validate title length
    if (title.length > 100) {
      throw new ValidationError('Title must be 100 characters or less');
    }

    // Validate description length
    if (description.length > 2000) {
      throw new ValidationError('Description must be 2000 characters or less');
    }

    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      throw new ValidationError('Price must be a positive number');
    }

    // Validate category
    if (!Object.values(ListingCategory).includes(category)) {
      throw new ValidationError(
        `Invalid category. Must be one of: ${Object.values(ListingCategory).join(', ')}`
      );
    }

    // Validate condition
    if (!Object.values(ListingCondition).includes(condition)) {
      throw new ValidationError(
        `Invalid condition. Must be one of: ${Object.values(ListingCondition).join(', ')}`
      );
    }

    const listing = await listingService.createListing({
      sellerId: req.user!.id,
      title,
      description,
      price: priceNum,
      category,
      condition,
    });

    // Notify all users in the same domain about the new listing
    try {
      const seller = await userService.findById(req.user!.id);
      if (seller) {
        const sellerDomain = userService.getUserDomain(seller.email);
        await notificationService.notifyDomainUsersOfNewListing(
          { ...listing, sellerName: seller.name },
          req.user!.id,
          sellerDomain
        );
      }
    } catch (notifError) {
      console.error('Failed to send domain notifications:', notifError);
      // Don't fail the listing creation if notifications fail
    }

    res.status(201).json({ listing });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Create listing error:', error);
      res.status(500).json({ error: 'Failed to create listing' });
    }
  }
});

// Get listing by ID
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await listingService.findByIdWithDetails(id);

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    // Track view (import ListingViewModel at top)
    const ListingViewModel = (await import('../models/ListingView')).default;
    const userId = req.user?.id;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    
    // Record view asynchronously (don't wait for it)
    ListingViewModel.recordView(id, userId, ipAddress, userAgent).catch(err => {
      console.error('Failed to record view:', err);
    });

    res.json({ listing });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({ error: 'Failed to retrieve listing' });
  }
});

// Update listing
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, price, category, condition } = req.body;

    // Check if listing exists and user owns it
    const existingListing = await listingService.findById(id);
    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to update this listing' });
    }

    // Validate fields if provided
    const updateData: any = {};

    if (title !== undefined) {
      if (title.length > 100) {
        throw new ValidationError('Title must be 100 characters or less');
      }
      updateData.title = title;
    }

    if (description !== undefined) {
      if (description.length > 2000) {
        throw new ValidationError('Description must be 2000 characters or less');
      }
      updateData.description = description;
    }

    if (price !== undefined) {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new ValidationError('Price must be a positive number');
      }
      updateData.price = priceNum;
    }

    if (category !== undefined) {
      if (!Object.values(ListingCategory).includes(category)) {
        throw new ValidationError(
          `Invalid category. Must be one of: ${Object.values(ListingCategory).join(', ')}`
        );
      }
      updateData.category = category;
    }

    if (condition !== undefined) {
      if (!Object.values(ListingCondition).includes(condition)) {
        throw new ValidationError(
          `Invalid condition. Must be one of: ${Object.values(ListingCondition).join(', ')}`
        );
      }
      updateData.condition = condition;
    }

    const listing = await listingService.updateListing(id, updateData);

    res.json({ listing });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Update listing error:', error);
      res.status(500).json({ error: 'Failed to update listing' });
    }
  }
});

// Delete listing (soft delete)
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Check if listing exists and user owns it
    const existingListing = await listingService.findById(id);
    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this listing' });
    }

    await listingService.deleteListing(id);

    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
});

// Mark listing as sold
router.post('/:id/mark-sold', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { buyerId } = req.body;

    // Check if listing exists and user owns it
    const existingListing = await listingService.findById(id);
    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to update this listing' });
    }

    validateRequired(buyerId, 'Buyer ID');

    await listingService.markAsSold(id, buyerId);

    res.json({ success: true, message: 'Listing marked as sold' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Mark as sold error:', error);
      res.status(500).json({ error: 'Failed to mark listing as sold' });
    }
  }
});

// Update listing status
router.put('/:id/status', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Check if listing exists and user owns it
    const existingListing = await listingService.findById(id);
    if (!existingListing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (existingListing.sellerId !== req.user!.id) {
      return res.status(403).json({ error: 'You do not have permission to update this listing' });
    }

    validateRequired(status, 'Status');

    if (status === 'pending') {
      await listingService.markAsPending(id);
    } else if (status === 'active') {
      await listingService.markAsActive(id);
    } else {
      throw new ValidationError('Invalid status. Use /mark-sold for sold status');
    }

    res.json({ success: true, message: 'Listing status updated' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Update status error:', error);
      res.status(500).json({ error: 'Failed to update listing status' });
    }
  }
});

export default router;
