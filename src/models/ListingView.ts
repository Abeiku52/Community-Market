import pool from '../config/database';

export interface ListingView {
  id: string;
  listingId: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  viewedAt: Date;
}

class ListingViewModel {
  async recordView(
    listingId: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<ListingView> {
    const result = await pool.query(
      `INSERT INTO listing_views (listing_id, user_id, ip_address, user_agent)
       VALUES ($1, $2, $3, $4)
       RETURNING 
         id, 
         listing_id as "listingId", 
         user_id as "userId",
         ip_address as "ipAddress",
         user_agent as "userAgent",
         viewed_at as "viewedAt"`,
      [listingId, userId, ipAddress, userAgent]
    );
    return result.rows[0];
  }

  async getViewCount(listingId: string): Promise<number> {
    const result = await pool.query(
      'SELECT view_count FROM listings WHERE id = $1',
      [listingId]
    );
    return result.rows[0]?.view_count || 0;
  }

  async getUniqueViewCount(listingId: string): Promise<number> {
    const result = await pool.query(
      `SELECT COUNT(DISTINCT COALESCE(user_id::text, ip_address)) as count
       FROM listing_views
       WHERE listing_id = $1`,
      [listingId]
    );
    return parseInt(result.rows[0].count);
  }

  async getViewsByListing(listingId: string, limit: number = 100): Promise<ListingView[]> {
    const result = await pool.query(
      `SELECT 
         id, 
         listing_id as "listingId", 
         user_id as "userId",
         ip_address as "ipAddress",
         user_agent as "userAgent",
         viewed_at as "viewedAt"
       FROM listing_views
       WHERE listing_id = $1
       ORDER BY viewed_at DESC
       LIMIT $2`,
      [listingId, limit]
    );
    return result.rows;
  }
}

export default new ListingViewModel();
