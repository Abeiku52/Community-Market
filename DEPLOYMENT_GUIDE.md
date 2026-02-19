# LincolnMarket - Production Deployment Guide

Date: February 19, 2026

---

## 🚀 Quick Start

This guide will help you deploy LincolnMarket to production. The system is now production-ready with all critical security features implemented.

---

## ✅ Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Production server provisioned (AWS EC2, DigitalOcean, etc.)
- [ ] PostgreSQL database set up (managed service recommended)
- [ ] Domain name registered and DNS configured
- [ ] SSL certificate obtained (Let's Encrypt or commercial)
- [ ] Node.js 18+ installed on server
- [ ] Git installed on server

### 2. Environment Variables
Create a `.env` file with production values:

```bash
# Server
NODE_ENV=production
PORT=3000

# Database (use managed PostgreSQL service)
DB_HOST=your-db-host.com
DB_PORT=5432
DB_NAME=lincolnmarket_prod
DB_USER=your_db_user
DB_PASSWORD=your_secure_password

# JWT (generate a strong secret)
JWT_SECRET=your_very_long_random_secret_key_here
JWT_EXPIRES_IN=24h

# Email (configure SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@lincoln.edu.gh
SMTP_PASSWORD=your_app_password
EMAIL_FROM=noreply@lincolnmarket.com

# URLs
FRONTEND_URL=https://lincolnmarket.com
API_BASE_URL=https://api.lincolnmarket.com

# Optional: AWS S3 for file storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=lincolnmarket-uploads

# Email Domain Restriction
ALLOWED_EMAIL_DOMAINS=lincoln.edu.gh
```

### 3. Security Checklist
- [x] Rate limiting enabled (express-rate-limit)
- [x] Security headers configured (helmet.js)
- [x] Response compression enabled
- [x] Environment variable validation
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] SQL injection prevention
- [x] CORS configured
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall configured
- [ ] Database backups scheduled

---

## 📦 Deployment Steps

### Step 1: Prepare the Server

```bash
# SSH into your server
ssh user@your-server-ip

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL client (if not using managed DB)
sudo apt install -y postgresql-client

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Clone and Build Backend

```bash
# Create app directory
sudo mkdir -p /var/www/lincolnmarket
sudo chown $USER:$USER /var/www/lincolnmarket
cd /var/www/lincolnmarket

# Clone repository
git clone https://github.com/your-org/lincolnmarket.git backend
cd backend

# Install dependencies
npm install --production

# Build TypeScript
npm run build

# Create .env file
nano .env
# (paste your production environment variables)

# Create uploads directory
mkdir -p uploads/listings
```

### Step 3: Set Up Database

```bash
# Connect to PostgreSQL
psql -h your-db-host -U your-db-user -d lincolnmarket_prod

# Run schema
\i src/database/schema.sql

# Run migrations
\i src/database/add-new-features.sql

# Verify tables
\dt

# Exit
\q
```

### Step 4: Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'lincolnmarket-api',
    script: 'dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
  }],
};
```

Start the application:

```bash
# Create logs directory
mkdir -p logs

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Set up PM2 to start on boot
pm2 startup
# (follow the instructions printed)

# Check status
pm2 status
pm2 logs lincolnmarket-api
```

### Step 5: Configure Nginx

Create `/etc/nginx/sites-available/lincolnmarket`:

```nginx
# API Server
server {
    listen 80;
    server_name api.lincolnmarket.com;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    # Security headers (additional to helmet.js)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Proxy to Node.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (uploads)
    location /uploads {
        alias /var/www/lincolnmarket/backend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Health check
    location /health {
        access_log off;
        proxy_pass http://localhost:3000/health;
    }
}
```

Enable the site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/lincolnmarket /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Step 6: Install SSL Certificate

```bash
# Get SSL certificate from Let's Encrypt
sudo certbot --nginx -d api.lincolnmarket.com

# Test auto-renewal
sudo certbot renew --dry-run

# Certificate will auto-renew every 90 days
```

### Step 7: Deploy Frontend

```bash
# On your local machine, build frontend
cd frontend
npm install
npm run build

# Upload to server (or use CI/CD)
scp -r dist/* user@your-server:/var/www/lincolnmarket/frontend/

# Or deploy to Vercel/Netlify (recommended)
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

Configure frontend Nginx (if self-hosting):

```nginx
# Frontend
server {
    listen 80;
    server_name lincolnmarket.com www.lincolnmarket.com;

    root /var/www/lincolnmarket/frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🔒 Security Hardening

### 1. Firewall Configuration

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PostgreSQL (only from app server)
sudo ufw allow from your-app-server-ip to any port 5432

# Check status
sudo ufw status
```

### 2. Database Security

```bash
# Create read-only user for analytics
CREATE USER analytics_user WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE lincolnmarket_prod TO analytics_user;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_user;

# Set up connection limits
ALTER USER your_db_user CONNECTION LIMIT 20;

# Enable SSL connections
# (configure in postgresql.conf)
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'
```

### 3. Automated Backups

Create backup script `/usr/local/bin/backup-db.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/lincolnmarket"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="lincolnmarket_$DATE.sql.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -h your-db-host -U your-db-user lincolnmarket_prod | gzip > $BACKUP_DIR/$FILENAME

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to S3 (optional)
aws s3 cp $BACKUP_DIR/$FILENAME s3://your-backup-bucket/database/

echo "Backup completed: $FILENAME"
```

Make executable and schedule:

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-db.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add line:
0 2 * * * /usr/local/bin/backup-db.sh >> /var/log/backup.log 2>&1
```

---

## 📊 Monitoring Setup

### 1. Error Tracking with Sentry

```bash
# Install Sentry SDK
npm install @sentry/node @sentry/tracing
```

Add to `src/index.ts`:

```typescript
import * as Sentry from '@sentry/node';

if (config.nodeEnv === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: config.nodeEnv,
    tracesSampleRate: 0.1,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
}

// ... your routes ...

// Error handler (before other error handlers)
if (config.nodeEnv === 'production') {
  app.use(Sentry.Handlers.errorHandler());
}
```

### 2. Application Monitoring

```bash
# PM2 monitoring
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true

# Monitor with PM2 Plus (optional)
pm2 link your-secret-key your-public-key
```

### 3. Server Monitoring

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up alerts (optional - use services like UptimeRobot)
# Monitor:
# - API endpoint: https://api.lincolnmarket.com/health
# - Frontend: https://lincolnmarket.com
# - Database connectivity
```

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/lincolnmarket/backend
            git pull origin main
            npm install --production
            npm run build
            pm2 restart lincolnmarket-api
```

---

## 🧪 Post-Deployment Testing

### 1. Health Checks

```bash
# API health
curl https://api.lincolnmarket.com/health

# Database health
curl https://api.lincolnmarket.com/health/db

# Frontend
curl -I https://lincolnmarket.com
```

### 2. Security Tests

```bash
# Check SSL
curl -I https://api.lincolnmarket.com | grep -i strict

# Check rate limiting
for i in {1..10}; do curl https://api.lincolnmarket.com/api/listings; done

# Check security headers
curl -I https://api.lincolnmarket.com | grep -i x-
```

### 3. Load Testing

```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test API endpoint
ab -n 1000 -c 10 https://api.lincolnmarket.com/api/listings

# Test with authentication
ab -n 100 -c 5 -H "Authorization: Bearer YOUR_TOKEN" https://api.lincolnmarket.com/api/favorites
```

---

## 📈 Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_offers_listing_id ON offers(listing_id);

-- Analyze tables
ANALYZE listings;
ANALYZE favorites;
ANALYZE offers;

-- Vacuum database
VACUUM ANALYZE;
```

### 2. Caching (Future Enhancement)

```bash
# Install Redis
sudo apt install redis-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Install Redis client
npm install redis
```

---

## 🚨 Troubleshooting

### Common Issues

**1. Application won't start**
```bash
# Check logs
pm2 logs lincolnmarket-api

# Check environment variables
pm2 env 0

# Restart
pm2 restart lincolnmarket-api
```

**2. Database connection errors**
```bash
# Test connection
psql -h your-db-host -U your-db-user -d lincolnmarket_prod

# Check firewall
sudo ufw status

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**3. High memory usage**
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart lincolnmarket-api

# Check for memory leaks
pm2 monit
```

**4. Slow API responses**
```bash
# Check database queries
# Enable slow query log in PostgreSQL

# Check server resources
htop

# Check network
ping your-db-host
```

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor error logs
- Check application status
- Review security alerts

**Weekly:**
- Review performance metrics
- Check disk space
- Update dependencies (security patches)

**Monthly:**
- Database optimization (VACUUM, ANALYZE)
- Review and rotate logs
- Security audit
- Backup verification

### Rollback Procedure

```bash
# Stop current version
pm2 stop lincolnmarket-api

# Checkout previous version
cd /var/www/lincolnmarket/backend
git log --oneline -10
git checkout <previous-commit-hash>

# Rebuild
npm install --production
npm run build

# Restart
pm2 restart lincolnmarket-api

# Verify
curl https://api.lincolnmarket.com/health
```

---

## 📝 Deployment Checklist Summary

- [ ] Server provisioned and configured
- [ ] PostgreSQL database set up
- [ ] Environment variables configured
- [ ] SSL certificate installed
- [ ] Application deployed with PM2
- [ ] Nginx configured as reverse proxy
- [ ] Firewall rules configured
- [ ] Database backups scheduled
- [ ] Monitoring and error tracking set up
- [ ] Health checks passing
- [ ] Security tests passing
- [ ] Load testing completed
- [ ] Documentation updated
- [ ] Team trained on deployment process

---

## 🎉 Success!

Your LincolnMarket application is now live in production! 

**Next Steps:**
1. Monitor the application for the first 24-48 hours
2. Gather user feedback
3. Plan optimization iterations
4. Set up analytics and tracking
5. Implement additional features from the roadmap

---

Last Updated: February 19, 2026
