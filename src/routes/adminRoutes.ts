import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { adminService } from '../services/adminService';

const router = Router();

// Middleware to check admin role
const requireAdmin = (req: Request, res: Response, next: Function) => {
  const user = (req as any).user;
  if (user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get dashboard stats
router.get('/dashboard', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await adminService.getDashboardStats();
    res.json(stats);
  } catch (error: any) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all users
router.get('/users', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await adminService.getAllUsers(page, limit);
    res.json(result);
  } catch (error: any) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all listings
router.get('/listings', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      category: req.query.category as string,
      flagged: req.query.flagged === 'true',
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50,
    };

    const result = await adminService.getAllListings(filters);
    res.json(result);
  } catch (error: any) {
    console.error('Error getting listings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user role
router.put('/users/:userId/role', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const adminId = (req as any).user.userId;

    if (!['staff', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    await adminService.updateUserRole(adminId, userId, role);
    res.json({ message: 'User role updated successfully' });
  } catch (error: any) {
    console.error('Error updating user role:', error);
    res.status(400).json({ error: error.message });
  }
});

// Suspend user
router.post('/users/:userId/suspend', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { reason, durationDays } = req.body;
    const adminId = (req as any).user.userId;

    if (!reason || !durationDays) {
      return res.status(400).json({ error: 'Reason and duration are required' });
    }

    await adminService.suspendUser(adminId, userId, reason, parseInt(durationDays));
    res.json({ message: 'User suspended successfully' });
  } catch (error: any) {
    console.error('Error suspending user:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete listing
router.delete('/listings/:listingId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { listingId } = req.params;
    const { reason } = req.body;
    const adminId = (req as any).user.userId;

    if (!reason) {
      return res.status(400).json({ error: 'Reason is required' });
    }

    await adminService.deleteListing(adminId, listingId, reason);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting listing:', error);
    res.status(400).json({ error: error.message });
  }
});

// Get activity log
router.get('/activity-log', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await adminService.getActivityLog(page, limit);
    res.json(result);
  } catch (error: any) {
    console.error('Error getting activity log:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get system settings
router.get('/settings', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await adminService.getSystemSettings();
    res.json(settings);
  } catch (error: any) {
    console.error('Error getting settings:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update system setting
router.put('/settings/:key', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    const adminId = (req as any).user.userId;

    await adminService.updateSystemSetting(adminId, key, value);
    res.json({ message: 'Setting updated successfully' });
  } catch (error: any) {
    console.error('Error updating setting:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
