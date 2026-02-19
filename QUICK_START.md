# LincolnMarket - Quick Start Guide

## 🚀 System Status

✅ **Backend**: Running on http://localhost:3000
✅ **Frontend**: Running on http://localhost:5174
✅ **Database**: PostgreSQL connected
✅ **Domain Features**: Fully implemented and ready

## 📋 What's New

All domain-based features are now live:

1. **Domain-Based Visibility** - Users only see listings from @lincoln.edu.gh
2. **New Listing Notifications** - Get notified when someone in your domain posts
3. **Interest Expression** - Click "I'm Interested" on any listing
4. **Seller Notifications** - Sellers get notified of interested buyers
5. **Anonymous Bidding** - Public sees "Anonymous", sellers see real names

## 🎯 Quick Test (5 minutes)

### Step 1: Create Test Users
1. Open http://localhost:5174
2. Click "Sign Up"
3. Create User A:
   - Email: `testa@lincoln.edu.gh`
   - Password: `Test123!`
   - Name: `Test User A`
   - School Affiliation: `High School`

4. Log out and create User B:
   - Email: `testb@lincoln.edu.gh`
   - Password: `Test123!`
   - Name: `Test User B`
   - School Affiliation: `Elementary`

### Step 2: Test Domain Filtering
1. Log in as User A
2. Click "Create Listing"
3. Create a listing:
   - Title: `Math Textbook`
   - Description: `Grade 10 math textbook in excellent condition`
   - Price: `25`
   - Category: `Books`
   - Condition: `Like New`
4. Submit the listing

### Step 3: Test Notifications
1. Log out and log in as User B
2. Check the notifications icon (bell icon in header)
3. You should see: "New listing: Math Textbook in your community"

### Step 4: Test Interest Expression
1. While logged in as User B, browse listings
2. Click on "Math Textbook" listing
3. Click "I'm Interested" button
4. Optionally add a message: "Is this still available?"
5. Click "Express Interest"
6. Button should change to "Remove Interest"

### Step 5: Test Seller Notification
1. Log out and log in as User A
2. Check notifications
3. You should see: "Test User B is interested in your listing: Math Textbook"

### Step 6: Test Anonymous Display
1. Create User C with email `testc@lincoln.edu.gh`
2. Log in as User C
3. Navigate to the "Math Textbook" listing
4. Scroll to "Interested Users" section
5. You should see: "1 person is interested" with name "Anonymous User"

### Step 7: Test Seller View
1. Log in as User A (the seller)
2. Navigate to your "Math Textbook" listing
3. Scroll to "Interested Users" section
4. You should see: "1 person is interested" with name "Test User B" (actual name)

## ✅ Success Criteria

If all steps work:
- ✅ Domain filtering is working
- ✅ Notifications are being sent
- ✅ Interest expression works
- ✅ Anonymous display is functioning
- ✅ Seller sees actual names

## 🔧 Troubleshooting

### Backend not responding
```bash
# Check if backend is running
curl http://localhost:3000/health

# If not running, restart:
npm run dev
```

### Frontend not loading
```bash
# Check if frontend is running
curl http://localhost:5174

# If not running, restart:
cd frontend
npm run dev
```

### Database connection error
```bash
# Check PostgreSQL is running
psql -U equagraine -d teacher_marketplace -c "SELECT 1"

# If error, start PostgreSQL:
brew services start postgresql@14
```

### Notifications not appearing
1. Check browser console for errors
2. Verify user email is verified (check database)
3. Check backend logs for notification creation

### Interest button not working
1. Check browser console for errors
2. Verify user is authenticated
3. Check that listing is active
4. Verify you're not the listing owner

## 📚 Documentation

- **Testing Guide**: `DOMAIN_FEATURES_TESTING_GUIDE.md`
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md`
- **Complete Summary**: `DOMAIN_FEATURES_COMPLETE.md`
- **Feature Specification**: `DOMAIN_BASED_FEATURES.md`

## 🌐 URLs

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health
- **Database Health**: http://localhost:3000/health/db

## 🔑 API Endpoints

### New Endpoints
- `POST /api/listings/:id/interest` - Express interest
- `GET /api/listings/:id/interests` - Get interested users
- `DELETE /api/listings/:id/interest` - Remove interest

### Modified Endpoints
- `GET /api/listings` - Now filters by domain
- `POST /api/listings` - Now sends notifications

## 💡 Tips

1. **Email Verification**: Users must verify their email to express interest
2. **Domain Matching**: Only @lincoln.edu.gh emails work
3. **Anonymous Display**: Automatically handled based on viewer role
4. **Duplicate Prevention**: Can't express interest twice in same listing
5. **Real-time Updates**: Use React Query for automatic updates

## 🎨 UI Features

### Listing Detail Page
- "I'm Interested" button for non-owners
- "Remove Interest" button if already interested
- Interested users section with count
- Anonymous/actual names based on viewer
- Optional message field
- Timestamps for each interest

### Notifications
- Bell icon in header shows unread count
- Click to view all notifications
- New listing notifications
- Interest notifications
- Click notification to view listing

## 🔐 Security

- Authentication required for all operations
- Email verification required to express interest
- Suspended users cannot express interest
- Domain filtering at database level
- Anonymization enforced server-side
- No duplicate interests allowed

## 📊 Database

### Check Interest Records
```sql
SELECT 
  li.*,
  u.name as user_name,
  l.title as listing_title
FROM listing_interests li
JOIN users u ON li.user_id = u.id
JOIN listings l ON li.listing_id = l.id;
```

### Check Notifications
```sql
SELECT 
  n.*,
  u.name as user_name
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.type IN ('new_listing', 'listing_interest')
ORDER BY n.created_at DESC
LIMIT 10;
```

## 🚀 Next Steps

1. Complete the quick test above
2. Test with multiple users
3. Verify all edge cases
4. Check notification delivery
5. Test anonymous display thoroughly
6. Verify domain filtering works correctly

## 📞 Support

If you encounter any issues:
1. Check browser console for errors
2. Check backend logs in terminal
3. Verify database connection
4. Review documentation files
5. Check that all services are running

---

**Status**: ✅ All systems operational and ready for testing!

**Last Updated**: February 18, 2026
