import pool from '../config/database';
import { Message, CreateMessageData, ConversationSummary, MessageWithUserInfo } from '../models/Message';

export class MessageService {
  async createMessage(data: CreateMessageData): Promise<Message> {
    const { senderId, recipientId, listingId, content } = data;

    const query = `
      INSERT INTO messages (sender_id, recipient_id, listing_id, content)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [senderId, recipientId, listingId, content];
    const result = await pool.query(query, values);

    return this.mapRowToMessage(result.rows[0]);
  }

  async findById(id: string): Promise<Message | null> {
    const query = 'SELECT * FROM messages WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToMessage(result.rows[0]);
  }

  async getConversation(
    userId: string,
    listingId: string,
    otherUserId: string
  ): Promise<Message[]> {
    const query = `
      SELECT * FROM messages
      WHERE listing_id = $1
        AND (
          (sender_id = $2 AND recipient_id = $3)
          OR (sender_id = $3 AND recipient_id = $2)
        )
      ORDER BY created_at ASC
    `;

    const values = [listingId, userId, otherUserId];
    const result = await pool.query(query, values);

    return result.rows.map(row => this.mapRowToMessage(row));
  }

  async getUserConversations(userId: string): Promise<ConversationSummary[]> {
    const query = `
      WITH latest_messages AS (
        SELECT DISTINCT ON (listing_id, 
          CASE 
            WHEN sender_id = $1 THEN recipient_id 
            ELSE sender_id 
          END)
          m.*,
          CASE 
            WHEN sender_id = $1 THEN recipient_id 
            ELSE sender_id 
          END as other_user_id,
          l.title as listing_title
        FROM messages m
        JOIN listings l ON m.listing_id = l.id
        WHERE sender_id = $1 OR recipient_id = $1
        ORDER BY listing_id, 
          CASE 
            WHEN sender_id = $1 THEN recipient_id 
            ELSE sender_id 
          END,
          created_at DESC
      ),
      unread_counts AS (
        SELECT 
          listing_id,
          sender_id as other_user_id,
          COUNT(*) as unread_count
        FROM messages
        WHERE recipient_id = $1 AND is_read = false
        GROUP BY listing_id, sender_id
      )
      SELECT 
        lm.listing_id,
        lm.other_user_id,
        u.name as other_user_name,
        lm.listing_title,
        lm.content as last_message,
        lm.created_at as last_message_time,
        COALESCE(uc.unread_count, 0) as unread_count
      FROM latest_messages lm
      JOIN users u ON lm.other_user_id = u.id
      LEFT JOIN unread_counts uc ON lm.listing_id = uc.listing_id 
        AND lm.other_user_id = uc.other_user_id
      ORDER BY lm.created_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map(row => ({
      listingId: row.listing_id,
      otherUserId: row.other_user_id,
      otherUserName: row.other_user_name,
      listingTitle: row.listing_title,
      lastMessage: row.last_message,
      lastMessageTime: row.last_message_time,
      unreadCount: parseInt(row.unread_count),
    }));
  }

  async markAsRead(messageId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE messages 
      SET is_read = true 
      WHERE id = $1 AND recipient_id = $2
    `;
    const result = await pool.query(query, [messageId, userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markConversationAsRead(
    userId: string,
    listingId: string,
    otherUserId: string
  ): Promise<void> {
    const query = `
      UPDATE messages 
      SET is_read = true 
      WHERE listing_id = $1 
        AND recipient_id = $2 
        AND sender_id = $3
        AND is_read = false
    `;
    await pool.query(query, [listingId, userId, otherUserId]);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE recipient_id = $1 AND is_read = false
    `;
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  async getUnreadCountForConversation(
    userId: string,
    listingId: string,
    otherUserId: string
  ): Promise<number> {
    const query = `
      SELECT COUNT(*) as count 
      FROM messages 
      WHERE listing_id = $1 
        AND recipient_id = $2 
        AND sender_id = $3
        AND is_read = false
    `;
    const result = await pool.query(query, [listingId, userId, otherUserId]);
    return parseInt(result.rows[0].count);
  }

  private mapRowToMessage(row: any): Message {
    return {
      id: row.id,
      senderId: row.sender_id,
      recipientId: row.recipient_id,
      listingId: row.listing_id,
      content: row.content,
      isRead: row.is_read,
      createdAt: row.created_at,
    };
  }
}

export default new MessageService();
