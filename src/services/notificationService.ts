import pool from '../config/database';
import emailService from '../utils/email';
import userService from './userService';
import {
  Notification,
  CreateNotificationData,
  NotificationType,
  NotificationPreference,
  UpdateNotificationPreferenceData,
} from '../models/Notification';

export class NotificationService {
  // Notification operations
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { userId, type, data: notificationData } = data;

    const query = `
      INSERT INTO notifications (user_id, type, data)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const values = [userId, type, JSON.stringify(notificationData)];
    const result = await pool.query(query, values);

    return this.mapRowToNotification(result.rows[0]);
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    let query = 'SELECT * FROM notifications WHERE user_id = $1';
    
    if (unreadOnly) {
      query += ' AND is_read = false';
    }
    
    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, [userId]);

    return result.rows.map(row => this.mapRowToNotification(row));
  }

  async markAsRead(notificationId: string, userId: string): Promise<boolean> {
    const query = `
      UPDATE notifications 
      SET is_read = true 
      WHERE id = $1 AND user_id = $2
    `;
    const result = await pool.query(query, [notificationId, userId]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  async markAllAsRead(userId: string): Promise<void> {
    const query = 'UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false';
    await pool.query(query, [userId]);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const query = 'SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false';
    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count);
  }

  // Notification preference operations
  async getPreferences(userId: string): Promise<NotificationPreference> {
    const query = 'SELECT * FROM notification_preferences WHERE user_id = $1';
    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      // Create default preferences if they don't exist
      return this.createDefaultPreferences(userId);
    }

    return this.mapRowToPreference(result.rows[0]);
  }

  async createDefaultPreferences(userId: string): Promise<NotificationPreference> {
    const query = `
      INSERT INTO notification_preferences (user_id)
      VALUES ($1)
      RETURNING *
    `;

    const result = await pool.query(query, [userId]);
    return this.mapRowToPreference(result.rows[0]);
  }

  async updatePreferences(
    userId: string,
    data: UpdateNotificationPreferenceData
  ): Promise<NotificationPreference> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.emailNewMessage !== undefined) {
      fields.push(`email_new_message = $${paramCount++}`);
      values.push(data.emailNewMessage);
    }
    if (data.emailListingInquiry !== undefined) {
      fields.push(`email_listing_inquiry = $${paramCount++}`);
      values.push(data.emailListingInquiry);
    }
    if (data.emailReviewReceived !== undefined) {
      fields.push(`email_review_received = $${paramCount++}`);
      values.push(data.emailReviewReceived);
    }
    if (data.emailDepartureReminder !== undefined) {
      fields.push(`email_departure_reminder = $${paramCount++}`);
      values.push(data.emailDepartureReminder);
    }
    if (data.inAppNewMessage !== undefined) {
      fields.push(`in_app_new_message = $${paramCount++}`);
      values.push(data.inAppNewMessage);
    }
    if (data.inAppListingInquiry !== undefined) {
      fields.push(`in_app_listing_inquiry = $${paramCount++}`);
      values.push(data.inAppListingInquiry);
    }
    if (data.inAppReviewReceived !== undefined) {
      fields.push(`in_app_review_received = $${paramCount++}`);
      values.push(data.inAppReviewReceived);
    }
    if (data.inAppDepartureReminder !== undefined) {
      fields.push(`in_app_departure_reminder = $${paramCount++}`);
      values.push(data.inAppDepartureReminder);
    }

    if (fields.length === 0) {
      return this.getPreferences(userId);
    }

    values.push(userId);
    const query = `
      UPDATE notification_preferences 
      SET ${fields.join(', ')}
      WHERE user_id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      // Create if doesn't exist
      return this.createDefaultPreferences(userId);
    }

    return this.mapRowToPreference(result.rows[0]);
  }

  // Send notifications based on preferences
  async sendNotification(
    userId: string,
    type: NotificationType,
    data: Record<string, any>
  ): Promise<void> {
    const preferences = await this.getPreferences(userId);
    const user = await userService.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Send in-app notification if enabled
    const inAppEnabled = this.isInAppEnabled(type, preferences);
    if (inAppEnabled) {
      await this.createNotification({ userId, type, data });
    }

    // Send email notification if enabled
    const emailEnabled = this.isEmailEnabled(type, preferences);
    if (emailEnabled) {
      try {
        await this.sendEmailNotification(user.email, type, data);
      } catch (error) {
        console.error('Failed to send email notification:', error);
        // Don't throw - email failure shouldn't break the flow
      }
    }
  }

  private isInAppEnabled(type: NotificationType, preferences: NotificationPreference): boolean {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return preferences.inAppNewMessage;
      case NotificationType.LISTING_INQUIRY:
        return preferences.inAppListingInquiry;
      case NotificationType.REVIEW_RECEIVED:
        return preferences.inAppReviewReceived;
      case NotificationType.DEPARTURE_REMINDER:
        return preferences.inAppDepartureReminder;
      case NotificationType.NEW_LISTING:
      case NotificationType.LISTING_INTEREST:
        return true; // Always enabled for new features
      default:
        return false;
    }
  }

  private isEmailEnabled(type: NotificationType, preferences: NotificationPreference): boolean {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return preferences.emailNewMessage;
      case NotificationType.LISTING_INQUIRY:
        return preferences.emailListingInquiry;
      case NotificationType.REVIEW_RECEIVED:
        return preferences.emailReviewReceived;
      case NotificationType.DEPARTURE_REMINDER:
        return preferences.emailDepartureReminder;
      default:
        return false;
    }
  }

  private async sendEmailNotification(
    email: string,
    type: NotificationType,
    data: Record<string, any>
  ): Promise<void> {
    // This is a simplified implementation
    // In production, you'd use proper email templates
    const subject = this.getEmailSubject(type);
    const body = this.getEmailBody(type, data);

    // For now, we'll just log it
    // In production, integrate with emailService
    console.log(`Email notification: ${email}, ${subject}, ${body}`);
  }

  private getEmailSubject(type: NotificationType): string {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return 'New Message - LincolnMarket';
      case NotificationType.LISTING_INQUIRY:
        return 'New Inquiry on Your Listing - LincolnMarket';
      case NotificationType.REVIEW_RECEIVED:
        return 'You Received a Review - LincolnMarket';
      case NotificationType.DEPARTURE_REMINDER:
        return 'Departure Date Reminder - LincolnMarket';
      case NotificationType.NEW_LISTING:
        return 'New Listing in Your Community - LincolnMarket';
      case NotificationType.LISTING_INTEREST:
        return 'Someone is Interested in Your Listing - LincolnMarket';
      default:
        return 'Notification - LincolnMarket';
    }
  }

  private getEmailBody(type: NotificationType, data: Record<string, any>): string {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return `You have a new message about "${data.listingTitle}" from ${data.senderName}.`;
      case NotificationType.LISTING_INQUIRY:
        return `${data.buyerName} sent you an inquiry about your listing "${data.listingTitle}".`;
      case NotificationType.REVIEW_RECEIVED:
        return `You received a ${data.rating}-star review from ${data.reviewerName}.`;
      case NotificationType.DEPARTURE_REMINDER:
        return `Your departure date is in ${data.daysRemaining} days. Don't forget to finalize your listings!`;
      case NotificationType.NEW_LISTING:
        return `${data.sellerName} posted a new listing: "${data.listingTitle}" for ${data.price}.`;
      case NotificationType.LISTING_INTEREST:
        return `${data.interestedUserName} is interested in your listing "${data.listingTitle}".`;
      default:
        return 'You have a new notification.';
    }
  }

  // Scheduled job: Send departure date reminders
  async sendDepartureDateReminders(): Promise<void> {
    const query = `
      SELECT id, email, name, departure_date
      FROM users
      WHERE departure_date IS NOT NULL
        AND departure_date >= CURRENT_DATE
        AND departure_date <= CURRENT_DATE + INTERVAL '7 days'
        AND email_verified = true
    `;

    const result = await pool.query(query);

    for (const user of result.rows) {
      const daysRemaining = Math.ceil(
        (new Date(user.departure_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      );

      await this.sendNotification(user.id, NotificationType.DEPARTURE_REMINDER, {
        daysRemaining,
        departureDate: user.departure_date,
      });
    }
  }

  private mapRowToNotification(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type as NotificationType,
      data: row.data,
      isRead: row.is_read,
      createdAt: row.created_at,
    };
  }

  private mapRowToPreference(row: any): NotificationPreference {
    return {
      userId: row.user_id,
      emailNewMessage: row.email_new_message,
      emailListingInquiry: row.email_listing_inquiry,
      emailReviewReceived: row.email_review_received,
      emailDepartureReminder: row.email_departure_reminder,
      inAppNewMessage: row.in_app_new_message,
      inAppListingInquiry: row.in_app_listing_inquiry,
      inAppReviewReceived: row.in_app_review_received,
      inAppDepartureReminder: row.in_app_departure_reminder,
    };
  }
  
  async notifyDomainUsersOfNewListing(listing: any, sellerId: string, sellerDomain: string): Promise<void> {
    // Import userService at the top if not already imported
    const domainUsers = await userService.getUsersByDomain(sellerDomain);
    
    // Notify all users in the same domain except the seller
    for (const user of domainUsers) {
      if (user.id !== sellerId) {
        await this.createNotification({
          userId: user.id,
          type: NotificationType.NEW_LISTING,
          data: {
            listingId: listing.id,
            listingTitle: listing.title,
            sellerName: listing.sellerName || 'A community member',
            price: listing.price,
          },
        });
      }
    }
  }

  async notifySellerOfInterest(listingId: string, listing: any, interestedUser: any): Promise<void> {
    await this.createNotification({
      userId: listing.sellerId,
      type: NotificationType.LISTING_INTEREST,
      data: {
        listingId,
        listingTitle: listing.title,
        interestedUserName: interestedUser.name,
        interestedUserId: interestedUser.id,
      },
    });
  }
}

export default new NotificationService();
