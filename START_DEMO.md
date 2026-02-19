# Quick Demo Mode

Want to see the application running without setting up PostgreSQL? Follow these steps:

## Option 1: View the Frontend Only

The frontend is fully functional and can be viewed without the backend:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

You'll see the UI, but API calls will fail (expected without backend).

## Option 2: Full Setup (Recommended)

For the complete experience with working features:

### 1. Install PostgreSQL

**macOS:**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Create database
createdb teacher_marketplace

# Load schema
psql -d teacher_marketplace -f src/database/schema.sql

# Verify
psql -d teacher_marketplace -c "\dt"
```

### 3. Start Application

**Terminal 1 - Backend:**
```bash
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### 4. Use the App

1. Go to http://localhost:5173
2. Register a new account
3. Check backend terminal for verification link
4. Login and explore!

## What You Can Do

Once running, you can:
- ✅ Register and login
- ✅ Browse listings
- ✅ Create listings with photos
- ✅ Search and filter
- ✅ Send messages
- ✅ View profiles
- ✅ Manage transactions
- ✅ Leave reviews

## Need Help?

See `SETUP_GUIDE.md` for detailed instructions and troubleshooting.
