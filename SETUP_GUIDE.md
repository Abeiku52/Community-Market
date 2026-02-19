# Complete Setup Guide

This guide will help you set up the Teacher Marketplace application from scratch.

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed
- ⚠️ AWS account (optional, for photo uploads)
- ⚠️ SMTP email service (optional, for email verification)

## Quick Start (5 minutes)

### Step 1: Install Dependencies

```bash
# Backend dependencies
npm install

# Frontend dependencies
cd frontend
npm install
cd ..
```

### Step 2: Database Setup

#### Option A: Using PostgreSQL (Recommended)

```bash
# Check if PostgreSQL is running
pg_isready

# If not running, start it:
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
# Windows: Start PostgreSQL service from Services

# Create the database
createdb teacher_marketplace

# Run the schema
psql -d teacher_marketplace -f src/database/schema.sql

# Verify tables were created
psql -d teacher_marketplace -c "\dt"
```

#### Option B: Using Docker (Alternative)

```bash
# Start PostgreSQL in Docker
docker run --name teacher-marketplace-db \
  -e POSTGRES_DB=teacher_marketplace \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:14

# Wait a few seconds, then run schema
psql -h localhost -U postgres -d teacher_marketplace -f src/database/schema.sql
```

### Step 3: Configure Environment

The `.env` file has been created with development defaults. Update if needed:

```bash
# Edit .env file
nano .env  # or use your preferred editor

# Key settings to verify:
# - DB_PASSWORD (default: postgres)
# - JWT_SECRET (already set for dev)
# - EMAIL_SERVICE (set to 'console' for dev)
```

### Step 4: Test Setup

```bash
# Run the setup test
node test-setup.js

# You should see:
# ✅ Environment variables configured
# ✅ Database connected successfully
# ✅ Found tables: ...
```

### Step 5: Start the Application

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev
```
You should see: `Server running on port 3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
You should see: `Local: http://localhost:5173/`

### Step 6: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Register" to create an account
3. Fill in the form (use any email for development)
4. Check the backend terminal for the verification link
5. Copy the verification token and verify your email
6. Login and start using the app!

## Detailed Configuration

### Database Configuration

If you need to change database settings:

```env
DB_HOST=localhost        # Database host
DB_PORT=5432            # PostgreSQL port
DB_NAME=teacher_marketplace
DB_USER=postgres        # Your PostgreSQL user
DB_PASSWORD=postgres    # Your PostgreSQL password
```

### Email Configuration

For development, emails are logged to console. For production:

```env
EMAIL_SERVICE=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com
```

**Gmail Setup:**
1. Enable 2-factor authentication
2. Generate an App Password
3. Use the App Password in SMTP_PASSWORD

### AWS S3 Configuration (Optional)

For photo uploads in production:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=your-bucket-name
```

For development, you can skip this - photos will be stored locally.

## Troubleshooting

### Database Connection Issues

**Error: "connection refused"**
```bash
# Check if PostgreSQL is running
pg_isready

# Start PostgreSQL
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql
```

**Error: "database does not exist"**
```bash
# Create the database
createdb teacher_marketplace
```

**Error: "authentication failed"**
```bash
# Update DB_PASSWORD in .env to match your PostgreSQL password
# Or reset PostgreSQL password:
psql postgres -c "ALTER USER postgres PASSWORD 'postgres';"
```

### Port Already in Use

**Backend (port 3000):**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9

# Or change PORT in .env
PORT=3001
```

**Frontend (port 5173):**
Vite will automatically suggest an alternative port.

### Build Errors

**TypeScript errors:**
```bash
cd frontend
npm run build
# Fix any errors shown
```

**Missing dependencies:**
```bash
# Backend
npm install

# Frontend
cd frontend
npm install
```

### Email Verification

In development mode (EMAIL_SERVICE=console), verification links are logged to the backend terminal:

```
📧 Email would be sent to: user@example.com
Subject: Verify your email
Verification link: http://localhost:5173/verify?token=abc123...
```

Copy the token and use it to verify.

## Testing

### Run Backend Tests
```bash
npm test
```

### Run Frontend Tests (when added)
```bash
cd frontend
npm test
```

## Production Deployment

Before deploying to production:

1. **Security:**
   - Change JWT_SECRET to a strong random string
   - Use environment variables, not .env file
   - Enable HTTPS/SSL
   - Configure CORS properly

2. **Database:**
   - Use a managed PostgreSQL service (AWS RDS, Heroku, etc.)
   - Enable SSL connections
   - Set up regular backups

3. **Email:**
   - Use a production email service (SendGrid, AWS SES, etc.)
   - Configure SPF/DKIM records

4. **File Storage:**
   - Configure AWS S3 for photo uploads
   - Set up CloudFront CDN (optional)

5. **Build:**
   ```bash
   # Backend
   npm run build
   
   # Frontend
   cd frontend
   npm run build
   ```

6. **Environment:**
   ```bash
   NODE_ENV=production
   ```

## Next Steps

- Read `API_DOCUMENTATION.md` for API details
- Check `frontend/README.md` for frontend architecture
- Review `.kiro/specs/teacher-marketplace/` for feature specs
- Customize styling in `frontend/src/App.css`
- Add more features from the spec

## Getting Help

If you encounter issues:
1. Check this guide's troubleshooting section
2. Review error messages in terminal
3. Check browser console for frontend errors
4. Verify all prerequisites are installed
5. Ensure all dependencies are installed

## Success Checklist

- [ ] Node.js and PostgreSQL installed
- [ ] Dependencies installed (backend and frontend)
- [ ] Database created and schema loaded
- [ ] .env file configured
- [ ] Setup test passes (node test-setup.js)
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can register a new user
- [ ] Can login
- [ ] Can create a listing

Once all items are checked, you're ready to develop! 🎉
