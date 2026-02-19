import pool from '../config/database';

export interface Offer {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  offerAmount: number;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn';
  counterAmount?: number;
  counterMessage?: string;
  createdAt: Date;
  respondedAt?: Date;
}

export interface OfferWithDetails extends Offer {
  buyerName: string;
  sellerName: string;
  listingTitle: string;
  listingPrice: number;
}

class OfferModel {
  async createOffer(
    listingId: string,
    buyerId: string,
    sellerId: string,
    offerAmount: number,
    message?: string
  ): Promise<Offer> {
    const result = await pool.query(
      `INSERT INTO offers (listing_id, buyer_id, seller_id, offer_amount, message, status)
       VALUES ($1, $2, $3, $4, $5, 'pending')
       RETURNING 
         id, 
         listing_id as "listingId", 
         buyer_id as "buyerId", 
         seller_id as "sellerId",
         offer_amount as "offerAmount",
         message,
         status,
         counter_amount as "counterAmount",
         counter_message as "counterMessage",
         created_at as "createdAt",
         responded_at as "respondedAt"`,
      [listingId, buyerId, sellerId, offerAmount, message]
    );
    return result.rows[0];
  }

  async getOfferById(offerId: string): Promise<OfferWithDetails | null> {
    const result = await pool.query(
      `SELECT 
        o.id,
        o.listing_id as "listingId",
        o.buyer_id as "buyerId",
        o.seller_id as "sellerId",
        o.offer_amount as "offerAmount",
        o.message,
        o.status,
        o.counter_amount as "counterAmount",
        o.counter_message as "counterMessage",
        o.created_at as "createdAt",
        o.responded_at as "respondedAt",
        buyer.name as "buyerName",
        seller.name as "sellerName",
        l.title as "listingTitle",
        l.price as "listingPrice"
       FROM offers o
       JOIN users buyer ON o.buyer_id = buyer.id
       JOIN users seller ON o.seller_id = seller.id
       JOIN listings l ON o.listing_id = l.id
       WHERE o.id = $1`,
      [offerId]
    );
    return result.rows[0] || null;
  }

  async getListingOffers(listingId: string): Promise<OfferWithDetails[]> {
    const result = await pool.query(
      `SELECT 
        o.id,
        o.listing_id as "listingId",
        o.buyer_id as "buyerId",
        o.seller_id as "sellerId",
        o.offer_amount as "offerAmount",
        o.message,
        o.status,
        o.counter_amount as "counterAmount",
        o.counter_message as "counterMessage",
        o.created_at as "createdAt",
        o.responded_at as "respondedAt",
        buyer.name as "buyerName",
        seller.name as "sellerName",
        l.title as "listingTitle",
        l.price as "listingPrice"
       FROM offers o
       JOIN users buyer ON o.buyer_id = buyer.id
       JOIN users seller ON o.seller_id = seller.id
       JOIN listings l ON o.listing_id = l.id
       WHERE o.listing_id = $1
       ORDER BY o.created_at DESC`,
      [listingId]
    );
    return result.rows;
  }

  async getUserOffers(userId: string, type: 'buyer' | 'seller'): Promise<OfferWithDetails[]> {
    const column = type === 'buyer' ? 'buyer_id' : 'seller_id';
    const result = await pool.query(
      `SELECT 
        o.id,
        o.listing_id as "listingId",
        o.buyer_id as "buyerId",
        o.seller_id as "sellerId",
        o.offer_amount as "offerAmount",
        o.message,
        o.status,
        o.counter_amount as "counterAmount",
        o.counter_message as "counterMessage",
        o.created_at as "createdAt",
        o.responded_at as "respondedAt",
        buyer.name as "buyerName",
        seller.name as "sellerName",
        l.title as "listingTitle",
        l.price as "listingPrice"
       FROM offers o
       JOIN users buyer ON o.buyer_id = buyer.id
       JOIN users seller ON o.seller_id = seller.id
       JOIN listings l ON o.listing_id = l.id
       WHERE o.${column} = $1
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async acceptOffer(offerId: string): Promise<Offer> {
    const result = await pool.query(
      `UPDATE offers 
       SET status = 'accepted', responded_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING 
         id, 
         listing_id as "listingId", 
         buyer_id as "buyerId", 
         seller_id as "sellerId",
         offer_amount as "offerAmount",
         message,
         status,
         counter_amount as "counterAmount",
         counter_message as "counterMessage",
         created_at as "createdAt",
         responded_at as "respondedAt"`,
      [offerId]
    );
    return result.rows[0];
  }

  async rejectOffer(offerId: string): Promise<Offer> {
    const result = await pool.query(
      `UPDATE offers 
       SET status = 'rejected', responded_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING 
         id, 
         listing_id as "listingId", 
         buyer_id as "buyerId", 
         seller_id as "sellerId",
         offer_amount as "offerAmount",
         message,
         status,
         counter_amount as "counterAmount",
         counter_message as "counterMessage",
         created_at as "createdAt",
         responded_at as "respondedAt"`,
      [offerId]
    );
    return result.rows[0];
  }

  async counterOffer(offerId: string, counterAmount: number, counterMessage?: string): Promise<Offer> {
    const result = await pool.query(
      `UPDATE offers 
       SET status = 'countered', 
           counter_amount = $2, 
           counter_message = $3,
           responded_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING 
         id, 
         listing_id as "listingId", 
         buyer_id as "buyerId", 
         seller_id as "sellerId",
         offer_amount as "offerAmount",
         message,
         status,
         counter_amount as "counterAmount",
         counter_message as "counterMessage",
         created_at as "createdAt",
         responded_at as "respondedAt"`,
      [offerId, counterAmount, counterMessage]
    );
    return result.rows[0];
  }

  async withdrawOffer(offerId: string): Promise<Offer> {
    const result = await pool.query(
      `UPDATE offers 
       SET status = 'withdrawn'
       WHERE id = $1
       RETURNING 
         id, 
         listing_id as "listingId", 
         buyer_id as "buyerId", 
         seller_id as "sellerId",
         offer_amount as "offerAmount",
         message,
         status,
         counter_amount as "counterAmount",
         counter_message as "counterMessage",
         created_at as "createdAt",
         responded_at as "respondedAt"`,
      [offerId]
    );
    return result.rows[0];
  }
}

export default new OfferModel();
