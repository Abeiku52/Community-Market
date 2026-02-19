import { Router, Request, Response } from 'express';
import authService from '../services/authService';
import { ValidationError } from '../utils/validation';
import crypto from 'crypto';
import pool from '../config/database';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { authLimiter } from '../middleware/rateLimit';

const router = Router();

// Apply strict rate limiting to all auth routes
router.use(authLimiter);

// Store magic link tokens temporarily (in production, use Redis)
const magicLinkTokens = new Map<string, { email: string; expiresAt: number }>();

// Register endpoint
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, schoolAffiliation } = req.body;

    const user = await authService.register({
      email,
      password,
      name,
      schoolAffiliation,
    });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        schoolAffiliation: user.schoolAffiliation,
        role: user.role,
        emailVerified: user.emailVerified,
      },
      message: 'Registration successful. Please check your email to verify your account.',
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

// Login endpoint
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const authToken = await authService.login({ email, password });

    res.json(authToken);
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(401).json({ error: error.message });
    } else {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
});

// Send magic link endpoint
router.post('/send-magic-link', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const result = await pool.query(
      'SELECT id, email, name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found. Please register first.' });
    }

    // Generate magic link token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store token
    magicLinkTokens.set(token, { email, expiresAt });

    // Send magic link email (logged to console in development)
    const magicLink = `${config.urls.frontend}/auth/magic-link?token=${token}`;
    console.log('\n📧 Magic Link Email:');
    console.log('To:', email);
    console.log('Magic Link:', magicLink);
    console.log('Expires in: 15 minutes\n');

    res.json({ 
      message: 'Magic link sent to your email',
      // In development, return the link
      ...(process.env.NODE_ENV === 'development' && { magicLink })
    });
  } catch (error) {
    console.error('Magic link error:', error);
    res.status(500).json({ error: 'Failed to send magic link' });
  }
});

// Verify magic link endpoint
router.get('/verify-magic-link', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Token is required' });
    }

    const tokenData = magicLinkTokens.get(token);

    if (!tokenData) {
      return res.status(400).json({ error: 'Invalid or expired magic link' });
    }

    if (Date.now() > tokenData.expiresAt) {
      magicLinkTokens.delete(token);
      return res.status(400).json({ error: 'Magic link has expired' });
    }

    // Get user
    const result = await pool.query(
      'SELECT id, email, name, school_affiliation, role, email_verified FROM users WHERE email = $1',
      [tokenData.email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    // Update last login
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    // Delete used token
    magicLinkTokens.delete(token);

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwt.secret as string,
      { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
    );

    res.json({
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        schoolAffiliation: user.school_affiliation,
        role: user.role,
        emailVerified: user.email_verified,
      },
    });
  } catch (error) {
    console.error('Magic link verification error:', error);
    res.status(500).json({ error: 'Failed to verify magic link' });
  }
});

// Email verification endpoint
router.post('/verify-email', async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Verification token is required' });
    }

    await authService.verifyEmail(token);

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    if (error instanceof ValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'Email verification failed' });
    }
  }
});

// Logout endpoint (client-side token removal, but included for completeness)
router.post('/logout', (req: Request, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
