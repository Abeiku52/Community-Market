import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';
import userService from '../services/userService';
import moderationService from '../services/moderationService';
import { ValidationError } from '../utils/validation';
import { UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const token = authHeader.substring(7);

    try {
      const decoded = authService.verifyAuthToken(token);
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireEmailVerification = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await userService.findById(req.user.id);

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    if (!user.emailVerified) {
      res.status(403).json({ error: 'Email verification required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Email verification check error:', error);
    res.status(500).json({ error: 'Verification check failed' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== UserRole.ADMIN) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};

export const checkSuspension = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const isSuspended = await moderationService.isUserSuspended(req.user.id);

    if (isSuspended) {
      res.status(403).json({ error: 'Your account is currently suspended' });
      return;
    }

    next();
  } catch (error) {
    console.error('Suspension check error:', error);
    res.status(500).json({ error: 'Failed to check suspension status' });
  }
};
