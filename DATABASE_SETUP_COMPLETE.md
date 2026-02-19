# Database Setup Complete

## What Was Done

### 1. PostgreSQL Installation
- Installed PostgreSQL 14 using Homebrew
- Started PostgreSQL service
- Created database: `teacher_marketplace`

### 2. Database Schema
- Applied schema from `src/database/schema.sql`
- Created all tables:
  - users (with 'staff' and 'admin' roles)
  - listings
  - listing_photos
  - messages
  - transactions
  - reviews
  - notifications
  - notification_preferences
  - flags
  - user_suspensions

### 3. Backend Server
- Restarted backend server
- Successfully connected to PostgreSQL
- Server running on http://localhost:3000

### 4. Frontend Server
- Running on http://localhost:5174

## Registration Now Works!

You can now:
1. Visit http://localhost:5174/register
2. Fill out the registration form with:
   - Full Name
   - Email (must end with @lincoln.edu.gh)
   - School Affiliation (e.g., "High School", "Elementary")
   - Password (at least 8 characters)
   - Confirm Password
3. Click "Create account"
4. You'll be automatically logged in and redirected to the home page!

## Test Registration

Try registering with:
- Email: `test@lincoln.edu.gh`
- Name: `Test User`
- School Affiliation: `High School`
- Password: `Password123`

After registration, you'll be immediately logged in and can start using the platform!

## Database Management

To access the database directly:
```bash
/opt/homebrew/opt/postgresql@14/bin/psql -d teacher_marketplace
```

Common commands:
- `\dt` - List all tables
- `\d users` - Describe users table
- `SELECT * FROM users;` - View all users
- `\q` - Quit

## PostgreSQL Service Management

Start PostgreSQL:
```bash
brew services start postgresql@14
```

Stop PostgreSQL:
```bash
brew services stop postgresql@14
```

Restart PostgreSQL:
```bash
brew services restart postgresql@14
```

Check status:
```bash
brew services list
```
