import pool from '../config/database';
import {
  Transaction,
  CreateTransactionData,
  TransactionStatus,
  TransactionWithDetails,
} from '../models/Transaction';
import listingService from './listingService';
import { ListingStatus } from '../models/Listing';

export class TransactionService {
  async createTransaction(data: CreateTransactionData): Promise<Transaction> {
    const { listingId, buyerId, sellerId } = data;

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Check if listing is active
      const listing = await listingService.findById(listingId);
      if (!listing || listing.status !== ListingStatus.ACTIVE) {
        throw new Error('Listing is not available for transaction');
      }

      // Create transaction
      const transactionQuery = `
        INSERT INTO transactions (listing_id, buyer_id, seller_id, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const transactionValues = [listingId, buyerId, sellerId, TransactionStatus.PENDING];
      const transactionResult = await client.query(transactionQuery, transactionValues);

      // Update listing status to pending
      await listingService.markAsPending(listingId);

      await client.query('COMMIT');

      return this.mapRowToTransaction(transactionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToTransaction(result.rows[0]);
  }

  async findByIdWithDetails(id: string): Promise<TransactionWithDetails | null> {
    const query = `
      SELECT 
        t.*,
        l.title as listing_title,
        l.price as listing_price,
        buyer.name as buyer_name,
        buyer.email as buyer_email,
        seller.name as seller_name,
        seller.email as seller_email
      FROM transactions t
      JOIN listings l ON t.listing_id = l.id
      JOIN users buyer ON t.buyer_id = buyer.id
      JOIN users seller ON t.seller_id = seller.id
      WHERE t.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      ...this.mapRowToTransaction(row),
      listingTitle: row.listing_title,
      listingPrice: parseFloat(row.listing_price),
      buyerName: row.buyer_name,
      buyerEmail: row.buyer_email,
      sellerName: row.seller_name,
      sellerEmail: row.seller_email,
    };
  }

  async findByListingId(listingId: string): Promise<Transaction | null> {
    const query = 'SELECT * FROM transactions WHERE listing_id = $1';
    const result = await pool.query(query, [listingId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToTransaction(result.rows[0]);
  }

  async completeTransaction(id: string, userId: string): Promise<Transaction> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get transaction
      const transaction = await this.findById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify user is the seller
      if (transaction.sellerId !== userId) {
        throw new Error('Only the seller can complete the transaction');
      }

      // Verify transaction is pending
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new Error('Transaction is not in pending status');
      }

      // Update transaction status
      const transactionQuery = `
        UPDATE transactions 
        SET status = $1, completed_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      const transactionResult = await client.query(transactionQuery, [
        TransactionStatus.COMPLETED,
        id,
      ]);

      // Mark listing as sold
      await listingService.markAsSold(transaction.listingId, transaction.buyerId);

      await client.query('COMMIT');

      return this.mapRowToTransaction(transactionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async cancelTransaction(id: string, userId: string): Promise<Transaction> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get transaction
      const transaction = await this.findById(id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      // Verify user is buyer or seller
      if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
        throw new Error('Only the buyer or seller can cancel the transaction');
      }

      // Verify transaction is pending
      if (transaction.status !== TransactionStatus.PENDING) {
        throw new Error('Only pending transactions can be cancelled');
      }

      // Update transaction status
      const transactionQuery = `
        UPDATE transactions 
        SET status = $1
        WHERE id = $2
        RETURNING *
      `;
      const transactionResult = await client.query(transactionQuery, [
        TransactionStatus.CANCELLED,
        id,
      ]);

      // Restore listing to active status
      await listingService.markAsActive(transaction.listingId);

      await client.query('COMMIT');

      return this.mapRowToTransaction(transactionResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getUserTransactions(userId: string): Promise<TransactionWithDetails[]> {
    const query = `
      SELECT 
        t.*,
        l.title as listing_title,
        l.price as listing_price,
        buyer.name as buyer_name,
        buyer.email as buyer_email,
        seller.name as seller_name,
        seller.email as seller_email
      FROM transactions t
      JOIN listings l ON t.listing_id = l.id
      JOIN users buyer ON t.buyer_id = buyer.id
      JOIN users seller ON t.seller_id = seller.id
      WHERE t.buyer_id = $1 OR t.seller_id = $1
      ORDER BY t.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map(row => ({
      ...this.mapRowToTransaction(row),
      listingTitle: row.listing_title,
      listingPrice: parseFloat(row.listing_price),
      buyerName: row.buyer_name,
      buyerEmail: row.buyer_email,
      sellerName: row.seller_name,
      sellerEmail: row.seller_email,
    }));
  }

  private mapRowToTransaction(row: any): Transaction {
    return {
      id: row.id,
      listingId: row.listing_id,
      buyerId: row.buyer_id,
      sellerId: row.seller_id,
      status: row.status as TransactionStatus,
      createdAt: row.created_at,
      completedAt: row.completed_at,
    };
  }
}

export default new TransactionService();
