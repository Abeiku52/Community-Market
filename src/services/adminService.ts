import pool from '../config/database';
import { ValidationError } from '../utils/errors';

export interface AdminStats {
  totalUsers: number;
  totalListings: number;
  activeListings: number;
  totalTransactions: number;
  totalBids: number;
  flaggedListings: number;
  recentActivity: any[];
}

export interface AdminActivityLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId?: string;
  details?: any;
  ipAddress?: string;
  createdAt: Date;
}

export const adminService = {
  async getDashboardStats(): Promise<AdminStats> {
    const [
      usersResult,
      listingsResult,
      activeListingsResult,
      transactionsResult,
      bidsResult,
      flagsResult,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM listings'),
      pool.query("SELECT COUNT(*) as count FROM listings WHERE status = 'active'"),
      pool.query('SELECT COUNT(*) as count FROM transactions'),
      pool.query('SELECT COUNT(*) as count FROM bids'),
      pool.query("SELECT COUNT(*) as count FROM flags WHERE status = 'pending'"),
    ]);

    // Get recent activity
    const activityResult = await pool.query(
      `SELECT 
        'listing' as type,
        l.id,
        l.title as description,
        l.created_at,
        u.name as user_name
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 10`
    );

    return {
      totalUsers: parseInt(usersResult.rows[0].count),
      totalListings: parseInt(listingsResult.rows[0].count),
      activeListings: parseInt(activeListingsResult.rows[0].count),
      totalTransactions: parseInt(transactionsResult.rows[0].count),
      totalBids: parseInt(bidsResult.rows[0].count),
      flaggedListings: parseInt(flagsResult.rows[0].count),
      recentActivity: activityResult.rows,
    };
  },

  async getAllUsers(page: number = 1, limit: number = 50) {
    const offset = (page - 1) * limit;
    
    const result = await pool.query(
      `SELECT 
        u.id,
        u.email,
        u.name,
        u.school_affiliation,
        u.role,
        u.email_verified,
        u.auth_method,
        u.last_login,
        u.created_at,
        COUNT(DISTINCT l.id) as listing_count,
        COUNT(DISTINCT t.id) as transaction_count
      FROM users u
      LEFT JOIN listings l ON u.id = l.seller_id
      LEFT JOIN transactions t ON u.id = t.buyer_id OR u.id = t.seller_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) as total FROM users');

    return {
      users: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    };
  },

  async getAllListings(filters?: {
    status?: string;
    category?: string;
    flagged?: boolean;
    page?: number;
    limit?: number;
  }) {
    const page = filters?.page || 1;
    const limit = filters?.limit || 50;
    const offset = (page - 1) * limit;

    let query = `
      SELECT 
        l.*,
        u.name as seller_name,
        u.email as seller_email,
        COUNT(DISTINCT b.id) as bid_count,
        COUNT(DISTINCT f.id) as flag_count
      FROM listings l
      JOIN users u ON l.seller_id = u.id
      LEFT JOIN bids b ON l.id = b.listing_id
      LEFT JOIN flags f ON l.id = f.listing_id AND f.status = 'pending'
      WHERE 1=1
    `;

    const params: any[] = [];
    let paramIndex = 1;

    if (filters?.status) {
      query += ` AND l.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters?.category) {
      query += ` AND l.category = $${paramIndex}`;
      params.push(filters.category);
      paramIndex++;
    }

    if (filters?.flagged) {
      query += ` AND EXISTS (SELECT 1 FROM flags WHERE listing_id = l.id AND status = 'pending')`;
    }

    query += ` GROUP BY l.id, u.name, u.email ORDER BY l.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM listings l WHERE 1=1';
    const countParams: any[] = [];
    let countParamIndex = 1;

    if (filters?.status) {
      countQuery += ` AND l.status = $${countParamIndex}`;
      countParams.push(filters.status);
      countParamIndex++;
    }

    if (filters?.category) {
      countQuery += ` AND l.category = $${countParamIndex}`;
      countParams.push(filters.category);
      countParamIndex++;
    }

    if (filters?.flagged) {
      countQuery += ` AND EXISTS (SELECT 1 FROM flags WHERE listing_id = l.id AND status = 'pending')`;
    }

    const countResult = await pool.query(countQuery, countParams);

    return {
      listings: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    };
  },

  async updateUserRole(adminId: string, userId: string, newRole: 'staff' | 'admin'): Promise<void> {
    // Verify admin
    const adminResult = await pool.query(
      "SELECT role FROM users WHERE id = $1 AND role = 'admin'",
      [adminId]
    );

    if (adminResult.rows.length === 0) {
      throw new ValidationError('Unauthorized: Admin access required');
    }

    // Update user role
    await pool.query(
      'UPDATE users SET role = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newRole, userId]
    );

    // Log activity
    await this.logActivity(adminId, 'update_user_role', 'user', userId, { newRole });
  },

  async suspendUser(adminId: string, userId: string, reason: string, durationDays: number): Promise<void> {
    // Verify admin
    const adminResult = await pool.query(
      "SELECT role FROM users WHERE id = $1 AND role = 'admin'",
      [adminId]
    );

    if (adminResult.rows.length === 0) {
      throw new ValidationError('Unauthorized: Admin access required');
    }

    // Create suspension
    await pool.query(
      `INSERT INTO user_suspensions (user_id, admin_id, reason, expires_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP + INTERVAL '${durationDays} days')`,
      [userId, adminId, reason]
    );

    // Log activity
    await this.logActivity(adminId, 'suspend_user', 'user', userId, { reason, durationDays });
  },

  async deleteListing(adminId: string, listingId: string, reason: string): Promise<void> {
    // Verify admin
    const adminResult = await pool.query(
      "SELECT role FROM users WHERE id = $1 AND role = 'admin'",
      [adminId]
    );

    if (adminResult.rows.length === 0) {
      throw new ValidationError('Unauthorized: Admin access required');
    }

    // Soft delete listing
    await pool.query(
      "UPDATE listings SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = $1",
      [listingId]
    );

    // Log activity
    await this.logActivity(adminId, 'delete_listing', 'listing', listingId, { reason });
  },

  async getActivityLog(page: number = 1, limit: number = 50): Promise<any> {
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT 
        a.*,
        u.name as admin_name,
        u.email as admin_email
      FROM admin_activity_log a
      JOIN users u ON a.admin_id = u.id
      ORDER BY a.created_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) as total FROM admin_activity_log');

    return {
      activities: result.rows,
      total: parseInt(countResult.rows[0].total),
      page,
      limit,
      totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limit),
    };
  },

  async logActivity(
    adminId: string,
    action: string,
    targetType: string,
    targetId?: string,
    details?: any,
    ipAddress?: string
  ): Promise<void> {
    await pool.query(
      `INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [adminId, action, targetType, targetId, JSON.stringify(details), ipAddress]
    );
  },

  async getSystemSettings(): Promise<any> {
    const result = await pool.query('SELECT * FROM system_settings');
    
    const settings: any = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });

    return settings;
  },

  async updateSystemSetting(adminId: string, key: string, value: any): Promise<void> {
    // Verify admin
    const adminResult = await pool.query(
      "SELECT role FROM users WHERE id = $1 AND role = 'admin'",
      [adminId]
    );

    if (adminResult.rows.length === 0) {
      throw new ValidationError('Unauthorized: Admin access required');
    }

    await pool.query(
      `INSERT INTO system_settings (key, value, updated_by, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       ON CONFLICT (key) DO UPDATE 
       SET value = $2, updated_by = $3, updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(value), adminId]
    );

    // Log activity
    await this.logActivity(adminId, 'update_system_setting', 'setting', key, { value });
  },
};
