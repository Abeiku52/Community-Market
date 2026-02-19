import pool from '../config/database';
import { ValidationError } from '../utils/errors';

export interface Bid {
  id: string;
  listingId: string;
  bidderId: string;
  amount: number;
  isAnonymous: boolean;
  status: 'active' | 'accepted' | 'rejected' | 'withdrawn';
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BidWithDetails extends Bid {
  bidderName: string;
  bidderEmail?: string;
}

export const biddingService = {
  async placeBid(
    listingId: string,
    bidderId: string,
    amount: number,
    isAnonymous: boolean = false,
    message?: string
  ): Promise<Bid> {
    // Check if listing exists and has bidding enabled
    const listingResult = await pool.query(
      'SELECT id, seller_id, bidding_enabled, minimum_bid, bid_increment, highest_bid_id, status FROM listings WHERE id = $1',
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      throw new ValidationError('Listing not found');
    }

    const listing = listingResult.rows[0];

    if (listing.status !== 'active') {
      throw new ValidationError('Listing is not active');
    }

    if (!listing.bidding_enabled) {
      throw new ValidationError('Bidding is not enabled for this listing');
    }

    if (listing.seller_id === bidderId) {
      throw new ValidationError('You cannot bid on your own listing');
    }

    // Check minimum bid
    if (listing.minimum_bid && amount < listing.minimum_bid) {
      throw new ValidationError(`Bid must be at least $${listing.minimum_bid}`);
    }

    // Check bid increment
    if (listing.highest_bid_id) {
      const highestBidResult = await pool.query(
        'SELECT amount FROM bids WHERE id = $1',
        [listing.highest_bid_id]
      );
      
      if (highestBidResult.rows.length > 0) {
        const highestBid = highestBidResult.rows[0].amount;
        const minimumNewBid = parseFloat(highestBid) + parseFloat(listing.bid_increment || 1);
        
        if (amount < minimumNewBid) {
          throw new ValidationError(`Bid must be at least $${minimumNewBid.toFixed(2)}`);
        }
      }
    }

    // Place bid
    const result = await pool.query(
      `INSERT INTO bids (listing_id, bidder_id, amount, is_anonymous, message, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       RETURNING id, listing_id, bidder_id, amount, is_anonymous, status, message, created_at, updated_at`,
      [listingId, bidderId, amount, isAnonymous, message]
    );

    // Notify seller
    await pool.query(
      `INSERT INTO notifications (user_id, type, data)
       VALUES ($1, 'new_bid', $2)`,
      [listing.seller_id, JSON.stringify({ listingId, bidId: result.rows[0].id, amount })]
    );

    return {
      id: result.rows[0].id,
      listingId: result.rows[0].listing_id,
      bidderId: result.rows[0].bidder_id,
      amount: parseFloat(result.rows[0].amount),
      isAnonymous: result.rows[0].is_anonymous,
      status: result.rows[0].status,
      message: result.rows[0].message,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at,
    };
  },

  async getListingBids(listingId: string, requesterId: string): Promise<BidWithDetails[]> {
    // Check if requester is the seller
    const listingResult = await pool.query(
      'SELECT seller_id FROM listings WHERE id = $1',
      [listingId]
    );

    if (listingResult.rows.length === 0) {
      throw new ValidationError('Listing not found');
    }

    const isSeller = listingResult.rows[0].seller_id === requesterId;

    // Get bids - if seller, show all details; otherwise, anonymize
    const result = await pool.query(
      `SELECT 
        b.id,
        b.listing_id,
        b.amount,
        b.status,
        b.message,
        b.created_at,
        b.updated_at,
        b.is_anonymous,
        CASE 
          WHEN b.is_anonymous AND $2 = FALSE THEN NULL 
          ELSE b.bidder_id 
        END as bidder_id,
        CASE 
          WHEN b.is_anonymous AND $2 = FALSE THEN 'Anonymous Bidder' 
          ELSE u.name 
        END as bidder_name,
        CASE 
          WHEN b.is_anonymous AND $2 = FALSE THEN NULL 
          ELSE u.email 
        END as bidder_email
      FROM bids b
      LEFT JOIN users u ON b.bidder_id = u.id
      WHERE b.listing_id = $1
      ORDER BY b.amount DESC, b.created_at DESC`,
      [listingId, isSeller]
    );

    return result.rows.map(row => ({
      id: row.id,
      listingId: row.listing_id,
      bidderId: row.bidder_id,
      amount: parseFloat(row.amount),
      isAnonymous: row.is_anonymous,
      status: row.status,
      message: row.message,
      bidderName: row.bidder_name,
      bidderEmail: row.bidder_email,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },

  async acceptBid(bidId: string, sellerId: string): Promise<void> {
    // Get bid and verify seller
    const bidResult = await pool.query(
      `SELECT b.id, b.listing_id, b.bidder_id, b.amount, l.seller_id
       FROM bids b
       JOIN listings l ON b.listing_id = l.id
       WHERE b.id = $1`,
      [bidId]
    );

    if (bidResult.rows.length === 0) {
      throw new ValidationError('Bid not found');
    }

    const bid = bidResult.rows[0];

    if (bid.seller_id !== sellerId) {
      throw new ValidationError('Only the seller can accept bids');
    }

    // Update bid status
    await pool.query(
      'UPDATE bids SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['accepted', bidId]
    );

    // Reject other bids
    await pool.query(
      'UPDATE bids SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE listing_id = $2 AND id != $3 AND status = $4',
      ['rejected', bid.listing_id, bidId, 'active']
    );

    // Update listing status
    await pool.query(
      'UPDATE listings SET status = $1, buyer_id = $2, sold_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['sold', bid.bidder_id, bid.listing_id]
    );

    // Notify bidder
    await pool.query(
      `INSERT INTO notifications (user_id, type, data)
       VALUES ($1, 'bid_accepted', $2)`,
      [bid.bidder_id, JSON.stringify({ listingId: bid.listing_id, bidId, amount: bid.amount })]
    );
  },

  async rejectBid(bidId: string, sellerId: string): Promise<void> {
    // Get bid and verify seller
    const bidResult = await pool.query(
      `SELECT b.id, b.listing_id, b.bidder_id, l.seller_id
       FROM bids b
       JOIN listings l ON b.listing_id = l.id
       WHERE b.id = $1`,
      [bidId]
    );

    if (bidResult.rows.length === 0) {
      throw new ValidationError('Bid not found');
    }

    const bid = bidResult.rows[0];

    if (bid.seller_id !== sellerId) {
      throw new ValidationError('Only the seller can reject bids');
    }

    // Update bid status
    await pool.query(
      'UPDATE bids SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['rejected', bidId]
    );

    // Notify bidder
    await pool.query(
      `INSERT INTO notifications (user_id, type, data)
       VALUES ($1, 'bid_rejected', $2)`,
      [bid.bidder_id, JSON.stringify({ listingId: bid.listing_id, bidId })]
    );
  },

  async withdrawBid(bidId: string, bidderId: string): Promise<void> {
    // Get bid and verify bidder
    const bidResult = await pool.query(
      'SELECT id, bidder_id, status FROM bids WHERE id = $1',
      [bidId]
    );

    if (bidResult.rows.length === 0) {
      throw new ValidationError('Bid not found');
    }

    const bid = bidResult.rows[0];

    if (bid.bidder_id !== bidderId) {
      throw new ValidationError('You can only withdraw your own bids');
    }

    if (bid.status !== 'active') {
      throw new ValidationError('Can only withdraw active bids');
    }

    // Update bid status
    await pool.query(
      'UPDATE bids SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['withdrawn', bidId]
    );
  },

  async getUserBids(userId: string): Promise<BidWithDetails[]> {
    const result = await pool.query(
      `SELECT 
        b.id,
        b.listing_id,
        b.bidder_id,
        b.amount,
        b.status,
        b.message,
        b.is_anonymous,
        b.created_at,
        b.updated_at,
        l.title as listing_title,
        u.name as bidder_name
      FROM bids b
      JOIN listings l ON b.listing_id = l.id
      JOIN users u ON b.bidder_id = u.id
      WHERE b.bidder_id = $1
      ORDER BY b.created_at DESC`,
      [userId]
    );

    return result.rows.map(row => ({
      id: row.id,
      listingId: row.listing_id,
      bidderId: row.bidder_id,
      amount: parseFloat(row.amount),
      isAnonymous: row.is_anonymous,
      status: row.status,
      message: row.message,
      bidderName: row.bidder_name,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  },
};
