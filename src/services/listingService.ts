import pool from '../config/database';
import {
  Listing,
  CreateListingData,
  UpdateListingData,
  ListingStatus,
  ListingPhoto,
  CreateListingPhotoData,
  ListingWithPhotos,
  ListingWithDetails,
  ListingCategory,
} from '../models/Listing';

export interface SearchFilters {
  category?: ListingCategory;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  leavingSoon?: boolean;
  userDomain?: string;
}

export class ListingService {
  async createListing(data: CreateListingData): Promise<Listing> {
    const { sellerId, title, description, price, category, condition } = data;

    const query = `
      INSERT INTO listings (seller_id, title, description, price, category, condition, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [sellerId, title, description, price, category, condition, ListingStatus.ACTIVE];
    const result = await pool.query(query, values);

    return this.mapRowToListing(result.rows[0]);
  }

  async findById(id: string): Promise<Listing | null> {
    const query = 'SELECT * FROM listings WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToListing(result.rows[0]);
  }

  async findByIdWithPhotos(id: string): Promise<ListingWithPhotos | null> {
    const listing = await this.findById(id);
    if (!listing) {
      return null;
    }

    const photos = await this.getListingPhotos(id);

    return {
      ...listing,
      photos,
    };
  }

  async findByIdWithDetails(id: string): Promise<ListingWithDetails | null> {
    const query = `
      SELECT 
        l.*,
        u.name as seller_name,
        u.email as seller_email,
        u.departure_date as seller_departure_date
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      WHERE l.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const photos = await this.getListingPhotos(id);

    const listing: ListingWithDetails = {
      ...this.mapRowToListing(row),
      photos,
      sellerName: row.seller_name,
      sellerEmail: row.seller_email,
      sellerDepartureDate: row.seller_departure_date,
    };

    // Calculate urgency indicator
    if (row.seller_departure_date) {
      const departureDate = new Date(row.seller_departure_date);
      const today = new Date();
      const daysUntilDeparture = Math.ceil(
        (departureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      listing.daysUntilDeparture = daysUntilDeparture;
      listing.isUrgent = daysUntilDeparture <= 30 && daysUntilDeparture >= 0;
    } else {
      listing.daysUntilDeparture = null;
      listing.isUrgent = false;
    }

    return listing;
  }

  async findBySellerId(sellerId: string): Promise<Listing[]> {
    const query = 'SELECT * FROM listings WHERE seller_id = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [sellerId]);

    return result.rows.map(row => this.mapRowToListing(row));
  }

  async findBySellerIdWithPhotos(sellerId: string): Promise<ListingWithPhotos[]> {
    const listings = await this.findBySellerId(sellerId);

    const listingsWithPhotos = await Promise.all(
      listings.map(async (listing) => {
        const photos = await this.getListingPhotos(listing.id);
        return {
          ...listing,
          photos,
        };
      })
    );

    return listingsWithPhotos;
  }


  async updateListing(id: string, data: UpdateListingData): Promise<Listing | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(data.description);
    }
    if (data.price !== undefined) {
      fields.push(`price = $${paramCount++}`);
      values.push(data.price);
    }
    if (data.category !== undefined) {
      fields.push(`category = $${paramCount++}`);
      values.push(data.category);
    }
    if (data.condition !== undefined) {
      fields.push(`condition = $${paramCount++}`);
      values.push(data.condition);
    }
    if (data.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(data.status);
    }
    if (data.buyerId !== undefined) {
      fields.push(`buyer_id = $${paramCount++}`);
      values.push(data.buyerId);
    }
    if (data.soldAt !== undefined) {
      fields.push(`sold_at = $${paramCount++}`);
      values.push(data.soldAt);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE listings 
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToListing(result.rows[0]);
  }

  async deleteListing(id: string): Promise<boolean> {
    const query = 'UPDATE listings SET status = $1 WHERE id = $2';
    const result = await pool.query(query, [ListingStatus.DELETED, id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markAsSold(id: string, buyerId: string): Promise<boolean> {
    const query = `
      UPDATE listings 
      SET status = $1, buyer_id = $2, sold_at = CURRENT_TIMESTAMP
      WHERE id = $3
    `;
    const result = await pool.query(query, [ListingStatus.SOLD, buyerId, id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markAsPending(id: string): Promise<boolean> {
    const query = 'UPDATE listings SET status = $1 WHERE id = $2';
    const result = await pool.query(query, [ListingStatus.PENDING, id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markAsActive(id: string): Promise<boolean> {
    const query = 'UPDATE listings SET status = $1 WHERE id = $2';
    const result = await pool.query(query, [ListingStatus.ACTIVE, id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async searchListings(filters: SearchFilters = {}): Promise<ListingWithPhotos[]> {
      const { category, minPrice, maxPrice, search, leavingSoon, userDomain } = filters;

      let query = `
        SELECT DISTINCT l.*
        FROM listings l
        LEFT JOIN users u ON l.seller_id = u.id
        WHERE l.status = $1
      `;
      const values: any[] = [ListingStatus.ACTIVE];
      let paramCount = 2;

      // Domain filter - only show listings from same domain
      if (userDomain) {
        query += ` AND LOWER(SUBSTRING(u.email FROM POSITION('@' IN u.email) + 1)) = LOWER($${paramCount++})`;
        values.push(userDomain);
      }

      // Category filter
      if (category) {
        query += ` AND l.category = $${paramCount++}`;
        values.push(category);
      }

      // Price range filter
      if (minPrice !== undefined) {
        query += ` AND l.price >= $${paramCount++}`;
        values.push(minPrice);
      }

      if (maxPrice !== undefined) {
        query += ` AND l.price <= $${paramCount++}`;
        values.push(maxPrice);
      }

      // Text search filter (title or description)
      if (search) {
        query += ` AND (LOWER(l.title) LIKE $${paramCount} OR LOWER(l.description) LIKE $${paramCount})`;
        values.push(`%${search.toLowerCase()}%`);
        paramCount++;
      }

      // Leaving soon filter (departure date within 30 days)
      if (leavingSoon) {
        query += ` AND u.departure_date IS NOT NULL AND u.departure_date <= CURRENT_DATE + INTERVAL '30 days' AND u.departure_date >= CURRENT_DATE`;
      }

      query += ' ORDER BY l.created_at DESC';

      const result = await pool.query(query, values);

      // Fetch photos for each listing
      const listingsWithPhotos: ListingWithPhotos[] = [];
      for (const row of result.rows) {
        const listing = this.mapRowToListing(row);
        const photos = await this.getListingPhotos(listing.id);
        listingsWithPhotos.push({
          ...listing,
          photos,
        });
      }

      return listingsWithPhotos;
    }

  // Photo operations
  async addPhoto(data: CreateListingPhotoData): Promise<ListingPhoto> {
    const { listingId, photoUrl, displayOrder } = data;

    const query = `
      INSERT INTO listing_photos (listing_id, photo_url, display_order)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [listingId, photoUrl, displayOrder];
    const result = await pool.query(query, values);

    return this.mapRowToListingPhoto(result.rows[0]);
  }

  async getListingPhotos(listingId: string): Promise<ListingPhoto[]> {
    const query = `
      SELECT * FROM listing_photos 
      WHERE listing_id = $1 
      ORDER BY display_order ASC
    `;
    const result = await pool.query(query, [listingId]);

    return result.rows.map(row => this.mapRowToListingPhoto(row));
  }

  async deletePhoto(photoId: string): Promise<boolean> {
    const query = 'DELETE FROM listing_photos WHERE id = $1';
    const result = await pool.query(query, [photoId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPhotoById(photoId: string): Promise<ListingPhoto | null> {
    const query = 'SELECT * FROM listing_photos WHERE id = $1';
    const result = await pool.query(query, [photoId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToListingPhoto(result.rows[0]);
  }

  async updatePhotoOrder(photoId: string, displayOrder: number): Promise<boolean> {
    const query = 'UPDATE listing_photos SET display_order = $1 WHERE id = $2';
    const result = await pool.query(query, [displayOrder, photoId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getPhotoCount(listingId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM listing_photos WHERE listing_id = $1';
    const result = await pool.query(query, [listingId]);
    return parseInt(result.rows[0].count);
  }

  private mapRowToListing(row: any): Listing {
    return {
      id: row.id,
      sellerId: row.seller_id,
      title: row.title,
      description: row.description,
      price: parseFloat(row.price),
      category: row.category,
      condition: row.condition,
      status: row.status,
      buyerId: row.buyer_id,
      soldAt: row.sold_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapRowToListingPhoto(row: any): ListingPhoto {
    return {
      id: row.id,
      listingId: row.listing_id,
      photoUrl: row.photo_url,
      displayOrder: row.display_order,
      createdAt: row.created_at,
    };
  }
  
  async createInterest(listingId: string, userId: string, message?: string): Promise<any> {
    const query = `
      INSERT INTO listing_interests (listing_id, user_id, message)
      VALUES ($1, $2, $3)
      ON CONFLICT (listing_id, user_id) DO NOTHING
      RETURNING *
    `;
    const values = [listingId, userId, message || null];
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Interest already exists');
    }
    
    return result.rows[0];
  }

  async getListingInterests(listingId: string, viewerId?: string): Promise<any[]> {
    const listing = await this.findById(listingId);
    if (!listing) {
      throw new Error('Listing not found');
    }

    const query = `
      SELECT 
        li.id,
        li.listing_id,
        li.user_id,
        li.message,
        li.created_at,
        u.name as user_name,
        u.email as user_email
      FROM listing_interests li
      JOIN users u ON li.user_id = u.id
      WHERE li.listing_id = $1
      ORDER BY li.created_at DESC
    `;
    
    const result = await pool.query(query, [listingId]);
    
    // If viewer is the seller, show actual names; otherwise show "Anonymous User"
    const isSeller = viewerId === listing.sellerId;
    
    return result.rows.map(row => ({
      id: row.id,
      listingId: row.listing_id,
      userId: row.user_id,
      userName: isSeller ? row.user_name : 'Anonymous User',
      userEmail: isSeller ? row.user_email : null,
      message: row.message,
      createdAt: row.created_at,
    }));
  }

  async hasUserExpressedInterest(listingId: string, userId: string): Promise<boolean> {
    const query = 'SELECT 1 FROM listing_interests WHERE listing_id = $1 AND user_id = $2';
    const result = await pool.query(query, [listingId, userId]);
    return result.rows.length > 0;
  }

  async removeInterest(listingId: string, userId: string): Promise<boolean> {
    const query = 'DELETE FROM listing_interests WHERE listing_id = $1 AND user_id = $2';
    const result = await pool.query(query, [listingId, userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getInterestCount(listingId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM listing_interests WHERE listing_id = $1';
    const result = await pool.query(query, [listingId]);
    return parseInt(result.rows[0].count);
  }
}

export default new ListingService();
