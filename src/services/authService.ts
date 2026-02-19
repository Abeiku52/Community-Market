import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import userService from './userService';
import emailService from '../utils/email';
import { validateSchoolEmail, validatePassword, validateRequired, ValidationError } from '../utils/validation';
import { User, UserRole } from '../models/User';

const SALT_ROUNDS = 12;

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  schoolAffiliation: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    emailVerified: boolean;
  };
}

class AuthService {
  async register(data: RegisterData): Promise<User> {
    const { email, password, name, schoolAffiliation } = data;

    // Validate input
    validateRequired(email, 'Email');
    validateRequired(password, 'Password');
    validateRequired(name, 'Name');
    validateRequired(schoolAffiliation, 'School affiliation');

    validateSchoolEmail(email);
    validatePassword(password);

    // Check if email already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      throw new ValidationError('Email already registered');
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await userService.createUser({
      email,
      passwordHash,
      name,
      schoolAffiliation,
      role: UserRole.STAFF,
    });

    // Generate verification token
    const verificationToken = this.generateVerificationToken(user.id);

    // Send verification email
    try {
      await emailService.sendVerificationEmail(email, verificationToken);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Don't fail registration if email fails
    }

    return user;
  }

  async login(data: LoginData): Promise<AuthToken> {
    const { email, password } = data;

    validateRequired(email, 'Email');
    validateRequired(password, 'Password');

    // Find user
    const user = await userService.findByEmail(email);
    if (!user) {
      throw new ValidationError('Invalid email or password');
    }

    // Validate password
    const isValidPassword = await this.validatePassword(password, user.passwordHash);
    if (!isValidPassword) {
      throw new ValidationError('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateAuthToken(user);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
      },
    };
  }

  async verifyEmail(token: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; type: string };

      if (decoded.type !== 'email_verification') {
        throw new ValidationError('Invalid verification token');
      }

      const user = await userService.findById(decoded.userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      if (user.emailVerified) {
        return; // Already verified
      }

      await userService.updateUser(user.id, { emailVerified: true });
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new ValidationError('Invalid or expired verification token');
      }
      throw error;
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  generateAuthToken(user: User): string {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
  }

  generateVerificationToken(userId: string): string {
    const payload = {
      userId,
      type: 'email_verification',
    };

    return jwt.sign(payload, config.jwt.secret, { expiresIn: '24h' } as jwt.SignOptions);
  }

  verifyAuthToken(token: string): { userId: string; email: string; role: UserRole } {
    try {
      const decoded = jwt.verify(token, config.jwt.secret) as {
        userId: string;
        email: string;
        role: UserRole;
      };
      return decoded;
    } catch (error) {
      throw new ValidationError('Invalid or expired token');
    }
  }
}

export default new AuthService();
