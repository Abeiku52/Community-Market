import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
function validateEnv() {
  const required = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Warn about default values in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET === 'change_this_secret_in_production') {
      throw new Error('JWT_SECRET must be changed in production');
    }
  }
}

// Run validation
validateEnv();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'teacher_marketplace',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  email: {
    service: process.env.EMAIL_SERVICE || 'smtp',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
    },
    from: process.env.EMAIL_FROM || 'noreply@teachermarketplace.com',
  },
  
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3BucketName: process.env.S3_BUCKET_NAME || 'teacher-marketplace-photos',
  },
  
  allowedEmailDomains: (process.env.ALLOWED_EMAIL_DOMAINS || 'school.edu').split(','),
  
  urls: {
    frontend: process.env.FRONTEND_URL || 'http://localhost:3001',
    apiBase: process.env.API_BASE_URL || 'http://localhost:3000/api',
  },
};
