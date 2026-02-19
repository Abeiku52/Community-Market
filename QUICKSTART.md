# Quick Start Guide

Get the Teacher Marketplace up and running in minutes.

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- AWS account (for S3)

## Step 1: Database Setup

```bash
# Create database
createdb teacher_marketplace

# Run schema
psql -d teacher_marketplace -f src/database/schema.sql
```

## Step 2: Backend Configuration

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your settings:
# - Database credentials
# - JWT secret
# - AWS S3 credentials
# - Email SMTP settings
```

## Step 3: Install Dependencies

```bash
# Backend
npm install

# Frontend
cd frontend
npm install
cd ..
```

## Step 4: Start the Application

Open two terminal windows:

### Terminal 1 - Backend
```bash
npm run dev
```
Backend runs on http://localhost:3000

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```
Frontend runs on http://localhost:5173

## Step 5: Test the Application

1. Open http://localhost:5173 in your browser
2. Click "Register" to create a new account
3. Check your email for verification (if email is configured)
4. Login and start creating listings!

## Common Issues

### Database Connection Error
- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure database exists: `psql -l | grep teacher_marketplace`

### Port Already in Use
- Backend: Change `PORT` in `.env`
- Frontend: Vite will prompt to use a different port

### AWS S3 Errors
- Verify AWS credentials in `.env`
- Check S3 bucket exists and has correct permissions
- Ensure bucket region matches `AWS_REGION` in `.env`

### Email Not Sending
- Check SMTP credentials in `.env`
- For development, consider using a service like Mailtrap
- Email verification is required before creating listings

## Next Steps

- Read `API_DOCUMENTATION.md` for API details
- Check `frontend/README.md` for frontend architecture
- Review `.kiro/specs/teacher-marketplace/` for feature specs
- Run tests: `npm test`

## Development Tips

- Backend auto-reloads with nodemon
- Frontend has hot module replacement (HMR)
- Use React DevTools for debugging frontend
- Check browser console for API errors
- Monitor backend logs for server issues

## Production Deployment

Before deploying to production:

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure CORS for your domain
5. Set up SSL/HTTPS
6. Configure production S3 bucket
7. Set up email service (SendGrid, etc.)
8. Build frontend: `cd frontend && npm run build`
9. Serve frontend build with a web server (nginx, etc.)

See deployment documentation for detailed instructions.
