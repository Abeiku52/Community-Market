import authService from '../authService';
import userService from '../userService';
import emailService from '../../utils/email';
import { ValidationError } from '../../utils/validation';
import { UserRole } from '../../models/User';

// Mock dependencies
jest.mock('../userService');
jest.mock('../../utils/email');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should successfully register a user with valid data', async () => {
      const mockUser = {
        id: '123',
        email: 'teacher@school.edu',
        passwordHash: 'hashed',
        name: 'John Doe',
        schoolAffiliation: 'International School',
        departureDate: null,
        role: UserRole.TEACHER,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userService.findByEmail as jest.Mock).mockResolvedValue(null);
      (userService.createUser as jest.Mock).mockResolvedValue(mockUser);
      (emailService.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.register({
        email: 'teacher@school.edu',
        password: 'Password123',
        name: 'John Doe',
        schoolAffiliation: 'International School',
      });

      expect(result).toEqual(mockUser);
      expect(userService.createUser).toHaveBeenCalled();
      expect(emailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should reject registration with invalid email domain', async () => {
      await expect(
        authService.register({
          email: 'teacher@invalid.com',
          password: 'Password123',
          name: 'John Doe',
          schoolAffiliation: 'International School',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject registration with weak password', async () => {
      await expect(
        authService.register({
          email: 'teacher@school.edu',
          password: 'weak',
          name: 'John Doe',
          schoolAffiliation: 'International School',
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject registration with existing email', async () => {
      const existingUser = {
        id: '123',
        email: 'teacher@school.edu',
        passwordHash: 'hashed',
        name: 'Existing User',
        schoolAffiliation: 'School',
        departureDate: null,
        role: UserRole.TEACHER,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userService.findByEmail as jest.Mock).mockResolvedValue(existingUser);

      await expect(
        authService.register({
          email: 'teacher@school.edu',
          password: 'Password123',
          name: 'John Doe',
          schoolAffiliation: 'International School',
        })
      ).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'teacher@school.edu',
        passwordHash: await authService.hashPassword('Password123'),
        name: 'John Doe',
        schoolAffiliation: 'International School',
        departureDate: null,
        role: UserRole.TEACHER,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login({
        email: 'teacher@school.edu',
        password: 'Password123',
      });

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe('teacher@school.edu');
    });

    it('should reject login with invalid email', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@school.edu',
          password: 'Password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should reject login with invalid password', async () => {
      const mockUser = {
        id: '123',
        email: 'teacher@school.edu',
        passwordHash: await authService.hashPassword('Password123'),
        name: 'John Doe',
        schoolAffiliation: 'International School',
        departureDate: null,
        role: UserRole.TEACHER,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.login({
          email: 'teacher@school.edu',
          password: 'WrongPassword123',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('password hashing', () => {
    it('should hash passwords securely', async () => {
      const password = 'Password123';
      const hash = await authService.hashPassword(password);

      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should validate correct passwords', async () => {
      const password = 'Password123';
      const hash = await authService.hashPassword(password);

      const isValid = await authService.validatePassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect passwords', async () => {
      const password = 'Password123';
      const hash = await authService.hashPassword(password);

      const isValid = await authService.validatePassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });
  });

  describe('token generation', () => {
    it('should generate valid auth tokens', () => {
      const mockUser = {
        id: '123',
        email: 'teacher@school.edu',
        passwordHash: 'hashed',
        name: 'John Doe',
        schoolAffiliation: 'International School',
        departureDate: null,
        role: UserRole.TEACHER,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const token = authService.generateAuthToken(mockUser);
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');

      const decoded = authService.verifyAuthToken(token);
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should reject invalid tokens', () => {
      expect(() => {
        authService.verifyAuthToken('invalid-token');
      }).toThrow(ValidationError);
    });
  });
});
