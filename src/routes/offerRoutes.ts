import express, { Response } from 'express';
import OfferModel from '../models/Offer';
import listingService from '../services/listingService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { NotFoundError, ForbiddenError, ValidationError } from '../utils/errors';

const router = express.Router();

// Create an offer
router.post('/', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId, offerAmount, message } = req.body;
    const buyerId = req.user!.id;

    if (!listingId || !offerAmount) {
      throw new ValidationError('Listing ID and offer amount are required');
    }

    if (offerAmount <= 0) {
      throw new ValidationError('Offer amount must be greater than 0');
    }

    // Get listing details
    const listing = await listingService.findById(listingId);
    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.status !== 'active') {
      throw new ValidationError('Cannot make offers on inactive listings');
    }

    if (listing.sellerId === buyerId) {
      throw new ValidationError('Cannot make an offer on your own listing');
    }

    const offer = await OfferModel.createOffer(
      listingId,
      buyerId,
      listing.sellerId,
      offerAmount,
      message
    );

    res.status(201).json({ message: 'Offer created successfully', offer });
  } catch (error) {
    next(error);
  }
});

// Get offers for a listing (seller only)
router.get('/listing/:listingId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { listingId } = req.params;
    const userId = req.user!.id;

    // Verify user is the seller
    const listing = await listingService.findById(listingId);
    if (!listing) {
      throw new NotFoundError('Listing not found');
    }

    if (listing.sellerId !== userId) {
      throw new ForbiddenError('Only the seller can view offers');
    }

    const offers = await OfferModel.getListingOffers(listingId);
    res.json(offers);
  } catch (error) {
    next(error);
  }
});

// Get user's offers (as buyer)
router.get('/my-offers', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const offers = await OfferModel.getUserOffers(userId, 'buyer');
    res.json(offers);
  } catch (error) {
    next(error);
  }
});

// Get offers received (as seller)
router.get('/received', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const offers = await OfferModel.getUserOffers(userId, 'seller');
    res.json(offers);
  } catch (error) {
    next(error);
  }
});

// Accept an offer
router.post('/:offerId/accept', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;

    const offer = await OfferModel.getOfferById(offerId);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    if (offer.sellerId !== userId) {
      throw new ForbiddenError('Only the seller can accept offers');
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      throw new ValidationError('Can only accept pending or countered offers');
    }

    const updatedOffer = await OfferModel.acceptOffer(offerId);
    res.json({ message: 'Offer accepted', offer: updatedOffer });
  } catch (error) {
    next(error);
  }
});

// Reject an offer
router.post('/:offerId/reject', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;

    const offer = await OfferModel.getOfferById(offerId);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    if (offer.sellerId !== userId) {
      throw new ForbiddenError('Only the seller can reject offers');
    }

    if (offer.status !== 'pending' && offer.status !== 'countered') {
      throw new ValidationError('Can only reject pending or countered offers');
    }

    const updatedOffer = await OfferModel.rejectOffer(offerId);
    res.json({ message: 'Offer rejected', offer: updatedOffer });
  } catch (error) {
    next(error);
  }
});

// Counter an offer
router.post('/:offerId/counter', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { offerId } = req.params;
    const { counterAmount, counterMessage } = req.body;
    const userId = req.user!.id;

    if (!counterAmount) {
      throw new ValidationError('Counter amount is required');
    }

    if (counterAmount <= 0) {
      throw new ValidationError('Counter amount must be greater than 0');
    }

    const offer = await OfferModel.getOfferById(offerId);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    if (offer.sellerId !== userId) {
      throw new ForbiddenError('Only the seller can counter offers');
    }

    if (offer.status !== 'pending') {
      throw new ValidationError('Can only counter pending offers');
    }

    const updatedOffer = await OfferModel.counterOffer(offerId, counterAmount, counterMessage);
    res.json({ message: 'Counter offer sent', offer: updatedOffer });
  } catch (error) {
    next(error);
  }
});

// Withdraw an offer
router.delete('/:offerId', authenticate, async (req: AuthRequest, res: Response, next) => {
  try {
    const { offerId } = req.params;
    const userId = req.user!.id;

    const offer = await OfferModel.getOfferById(offerId);
    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    if (offer.buyerId !== userId) {
      throw new ForbiddenError('Only the buyer can withdraw offers');
    }

    if (offer.status === 'accepted') {
      throw new ValidationError('Cannot withdraw accepted offers');
    }

    const updatedOffer = await OfferModel.withdrawOffer(offerId);
    res.json({ message: 'Offer withdrawn', offer: updatedOffer });
  } catch (error) {
    next(error);
  }
});

export default router;
