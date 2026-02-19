import pool from '../config/database';
import {
  Flag,
  CreateFlagData,
  FlagStatus,
  ModerationAction,
  FlagWithDetails,
  UserSuspension,
  CreateUserSuspensionData,
  UserSuspensionWithDetails,
} from '../models/Moderation';
import listingService from './listingService';
import userService from './userService';
import notificationService from './notificationService';
import { NotificationType } from '../models/Notification';
import { ListingStatus } from '../models/Listing';
import { UserRole } from '../models/User';

export class ModerationService {
  // Flag operations
  async createFlag(data: CreateFlagData): Promise<Flag> {
    const { listingId, reporterId, reason } = data;

    const query = `
      INSERT INTO flags (listing_id, reporter_id, reason, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [listingId, reporterId, reason, FlagStatus.PENDING];
    const result = await pool.query(query, values);

    const flag = this.mapRowToFlag(result.rows[0]);

    // Notify all admins
    await this.notifyAdmins(listingId, reporterId, reason);

    return flag;
  }

  async getFlaggedListings(): Promise<FlagWithDetails[]> {
    const query = `
      SELECT 
        f.*,
        l.title as listing_title,
        l.status as listing_status,
        reporter.name as reporter_name,
        reporter.email as reporter_email,
        reviewer.name as reviewer_name
      FROM flags f
      JOIN listings l ON f.listing_id = l.id
      JOIN users reporter ON f.reporter_id = reporter.id
      LEFT JOIN users reviewer ON f.reviewed_by = reviewer.id
      WHERE f.status = $1
      ORDER BY f.created_at DESC
    `;

    const result = await pool.query(query, [FlagStatus.PENDING]);

    return result.rows.map(row => ({
      ...this.mapRowToFlag(row),
      listingTitle: row.listing_title,
      listingStatus: row.listing_status,
      reporterName: row.reporter_name,
      reporterEmail: row.reporter_email,
      reviewerName: row.reviewer_name,
    }));
  }

  async reviewFlag(
    flagId: string,
    adminId: string,
    action: ModerationAction
  ): Promise<void> {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      // Get flag
      const flagQuery = 'SELECT * FROM flags WHERE id = $1';
      const flagResult = await client.query(flagQuery, [flagId]);

      if (flagResult.rows.length === 0) {
        throw new Error('Flag not found');
      }

      const flag = this.mapRowToFlag(flagResult.rows[0]);

      // Update flag status
      const updateFlagQuery = `
        UPDATE flags 
        SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP, action = $3
        WHERE id = $4
      `;
      await client.query(updateFlagQuery, [FlagStatus.REVIEWED, adminId, action, flagId]);

      // Apply moderation action to listing
      if (action === ModerationAction.HIDE || action === ModerationAction.DELETE) {
        await listingService.updateListing(flag.listingId, {
          status: ListingStatus.DELETED,
        });
      } else if (action === ModerationAction.RESTORE) {
        await listingService.updateListing(flag.listingId, {
          status: ListingStatus.ACTIVE,
        });
      }

      // Notify listing owner
      const listing = await listingService.findById(flag.listingId);
      if (listing) {
        await notificationService.sendNotification(
          listing.sellerId,
          NotificationType.LISTING_INQUIRY,
          {
            listingId: listing.id,
            listingTitle: listing.title,
            action,
            message: `Your listing has been ${action} by a moderator.`,
          }
        );
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // User suspension operations
  async suspendUser(data: CreateUserSuspensionData): Promise<UserSuspension> {
    const { userId, adminId, reason, durationDays } = data;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    const query = `
      INSERT INTO user_suspensions (user_id, admin_id, reason, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const values = [userId, adminId, reason, expiresAt];
    const result = await pool.query(query, values);

    const suspension = this.mapRowToUserSuspension(result.rows[0]);

    // Notify suspended user
    await notificationService.sendNotification(userId, NotificationType.LISTING_INQUIRY, {
      message: `Your account has been suspended until ${expiresAt.toDateString()}. Reason: ${reason}`,
      expiresAt,
    });

    return suspension;
  }

  async isUserSuspended(userId: string): Promise<boolean> {
    const query = `
      SELECT COUNT(*) as count
      FROM user_suspensions
      WHERE user_id = $1 
        AND expires_at > CURRENT_TIMESTAMP
    `;

    const result = await pool.query(query, [userId]);
    return parseInt(result.rows[0].count) > 0;
  }

  async getUserSuspensions(userId: string): Promise<UserSuspensionWithDetails[]> {
    const query = `
      SELECT 
        us.*,
        u.name as user_name,
        u.email as user_email,
        admin.name as admin_name,
        CASE WHEN us.expires_at > CURRENT_TIMESTAMP THEN true ELSE false END as is_active
      FROM user_suspensions us
      JOIN users u ON us.user_id = u.id
      JOIN users admin ON us.admin_id = admin.id
      WHERE us.user_id = $1
      ORDER BY us.suspended_at DESC
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map(row => ({
      ...this.mapRowToUserSuspension(row),
      userName: row.user_name,
      userEmail: row.user_email,
      adminName: row.admin_name,
      isActive: row.is_active,
    }));
  }

  private async notifyAdmins(listingId: string, reporterId: string, reason: string): Promise<void> {
    // Get all admin users
    const query = 'SELECT id FROM users WHERE role = $1';
    const result = await pool.query(query, [UserRole.ADMIN]);

    const listing = await listingService.findById(listingId);
    const reporter = await userService.findById(reporterId);

    for (const admin of result.rows) {
      await notificationService.sendNotification(admin.id, NotificationType.LISTING_INQUIRY, {
        listingId,
        listingTitle: listing?.title || 'Unknown',
        reporterId,
        reporterName: reporter?.name || 'Unknown',
        reason,
        message: 'A listing has been flagged for review',
      });
    }
  }

  private mapRowToFlag(row: any): Flag {
    return {
      id: row.id,
      listingId: row.listing_id,
      reporterId: row.reporter_id,
      reason: row.reason,
      status: row.status as FlagStatus,
      reviewedBy: row.reviewed_by,
      reviewedAt: row.reviewed_at,
      action: row.action as ModerationAction | null,
      createdAt: row.created_at,
    };
  }

  private mapRowToUserSuspension(row: any): UserSuspension {
    return {
      id: row.id,
      userId: row.user_id,
      adminId: row.admin_id,
      reason: row.reason,
      suspendedAt: row.suspended_at,
      expiresAt: row.expires_at,
    };
  }
}

export default new ModerationService();
