import pool from '../config/database';

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: Date;
}

export interface FavoriteWithListing extends Favorite {
  listing: {
    id: string;
    title: string;
    price: number;
    category: string;
    status: string;
    photoUrl?: string;
    sellerName: string;
  };
}

class FavoriteModel {
  async addFavorite(userId: string, listingId: string): Promise<Favorite> {
    const result = await pool.query(
      `INSERT INTO favorites (user_id, listing_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, listing_id) DO NOTHING
       RETURNING id, user_id as "userId", listing_id as "listingId", created_at as "createdAt"`,
      [userId, listingId]
    );
    return result.rows[0];
  }

  async removeFavorite(userId: string, listingId: string): Promise<boolean> {
    const result = await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );
    return result.rowCount! > 0;
  }

  async getUserFavorites(userId: string): Promise<FavoriteWithListing[]> {
    const result = await pool.query(
      `SELECT 
        f.id,
        f.user_id as "userId",
        f.listing_id as "listingId",
        f.created_at as "createdAt",
        json_build_object(
          'id', l.id,
          'title', l.title,
          'price', l.price,
          'category', l.category,
          'status', l.status,
          'photoUrl', (SELECT photo_url FROM listing_photos WHERE listing_id = l.id ORDER BY display_order LIMIT 1),
          'sellerName', u.name
        ) as listing
       FROM favorites f
       JOIN listings l ON f.listing_id = l.id
       JOIN users u ON l.seller_id = u.id
       WHERE f.user_id = $1
       ORDER BY f.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async isFavorited(userId: string, listingId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [userId, listingId]
    );
    return result.rows.length > 0;
  }

  async getFavoriteCount(listingId: string): Promise<number> {
    const result = await pool.query(
      'SELECT COUNT(*) as count FROM favorites WHERE listing_id = $1',
      [listingId]
    );
    return parseInt(result.rows[0].count);
  }
}

export default new FavoriteModel();
