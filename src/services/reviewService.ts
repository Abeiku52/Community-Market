import pool from '../config/database';
import { Review, CreateReviewData, ReviewWithUserInfo, UserRating } from '../models/Review';
import transactionService from './transactionService';
import notificationService from './notificationService';
import { NotificationType } from '../models/Notification';
import { TransactionStatus } from '../models/Transaction';

export class ReviewService {
  async createReview(data: CreateReviewData): Promise<Review> {
    const { transactionId, reviewerId, revieweeId, rating, comment } = data;

    // Validate transaction is completed
    const transaction = await transactionService.findById(transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new Error('Can only review completed transactions');
    }

    // Validate reviewer is the buyer
    if (transaction.buyerId !== reviewerId) {
      throw new Error('Only the buyer can review the seller');
    }

    // Validate reviewee is the seller
    if (transaction.sellerId !== revieweeId) {
      throw new Error('Invalid reviewee');
    }

    // Check if review already exists
    const existingReview = await this.findByTransactionId(transactionId);
    if (existingReview) {
      throw new Error('Review already exists for this transaction');
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const query = `
      INSERT INTO reviews (transaction_id, reviewer_id, reviewee_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [transactionId, reviewerId, revieweeId, rating, comment || null];
    const result = await pool.query(query, values);

    const review = this.mapRowToReview(result.rows[0]);

    // Send notification to reviewee
    const transactionDetails = await transactionService.findByIdWithDetails(transactionId);
    if (transactionDetails) {
      await notificationService.sendNotification(revieweeId, NotificationType.REVIEW_RECEIVED, {
        reviewId: review.id,
        reviewerName: transactionDetails.buyerName,
        rating,
        listingTitle: transactionDetails.listingTitle,
      });
    }

    return review;
  }

  async findById(id: string): Promise<Review | null> {
    const query = 'SELECT * FROM reviews WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToReview(result.rows[0]);
  }

  async findByTransactionId(transactionId: string): Promise<Review | null> {
    const query = 'SELECT * FROM reviews WHERE transaction_id = $1';
    const result = await pool.query(query, [transactionId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToReview(result.rows[0]);
  }

  async getUserReviews(userId: string): Promise<ReviewWithUserInfo[]> {
    const query = `
      SELECT 
        r.*,
        u.name as reviewer_name,
        u.email as reviewer_email,
        l.title as listing_title
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      JOIN transactions t ON r.transaction_id = t.id
      JOIN listings l ON t.listing_id = l.id
      WHERE r.reviewee_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map(row => ({
      ...this.mapRowToReview(row),
      reviewerName: row.reviewer_name,
      reviewerEmail: row.reviewer_email,
      listingTitle: row.listing_title,
    }));
  }

  async getUserRating(userId: string): Promise<UserRating> {
    const reviews = await this.getUserReviews(userId);

    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
    }

    return {
      userId,
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      totalReviews: reviews.length,
      reviews,
    };
  }

  async calculateAverageRating(userId: string): Promise<number> {
    const query = `
      SELECT AVG(rating) as average_rating
      FROM reviews
      WHERE reviewee_id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (!result.rows[0].average_rating) {
      return 0;
    }

    return Math.round(parseFloat(result.rows[0].average_rating) * 10) / 10;
  }

  private mapRowToReview(row: any): Review {
    return {
      id: row.id,
      transactionId: row.transaction_id,
      reviewerId: row.reviewer_id,
      revieweeId: row.reviewee_id,
      rating: row.rating,
      comment: row.comment,
      createdAt: row.created_at,
    };
  }
}

export default new ReviewService();
