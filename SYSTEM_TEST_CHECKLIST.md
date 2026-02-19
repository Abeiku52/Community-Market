# 🧪 LincolnMarket System Test Checklist

## ✅ System Status
- **Backend**: Running on http://localhost:3000 ✅
- **Frontend**: Running on http://localhost:5174 ✅
- **Database**: PostgreSQL connected ✅
- **API**: Responding correctly ✅
- **Listings**: 3 active listings found ✅

---

## 📋 Testing Checklist

### 1. Home Page (http://localhost:5174)
Open your browser and navigate to http://localhost:5174

**Expected Results:**
- [ ] Page loads with professional blue design
- [ ] Hero section displays "Find Great Deals from Lincoln Staff"
- [ ] Stats cards show: Active Listings, Happy Staff Members, School Sections
- [ ] 3 listings are displayed in a grid
- [ ] Search bar is visible with icon properly aligned
- [ ] Filter dropdowns work (Category, Price Range)
- [ ] "Leaving Soon" toggle is visible
- [ ] Navigation bar shows "LincolnMarket" logo
- [ ] Footer displays at bottom

**Test Actions:**
1. Type in search bar - should filter listings
2. Select a category - should filter by category
3. Enter min/max price - should filter by price
4. Toggle "Leaving Soon" - should filter urgent listings

---

### 2. User Authentication

#### Test Registration
Navigate to: http://localhost:5174/register

**Expected Results:**
- [ ] Registration form displays
- [ ] Fields: Email, Password, Name, School Affiliation
- [ ] Email must be @lincoln.edu.gh
- [ ] After registration, auto-login occurs
- [ ] Redirects to home page

**Test Actions:**
1. Try registering with non-@lincoln.edu.gh email - should fail
2. Register with valid @lincoln.edu.gh email - should succeed
3. Should automatically log in after registration

#### Test Login
Navigate to: http://localhost:5174/login

**Current User:**
- Email: equagraine@lincoln.edu.gh
- Password: [your password]

**Expected Results:**
- [ ] Login form displays
- [ ] Can login with existing credentials
- [ ] After login, redirects to home page
- [ ] User avatar appears in navigation

---

### 3. Create Listing
Navigate to: http://localhost:5174/create-listing (must be logged in)

**Expected Results:**
- [ ] Two-column layout: Form on left, Preview on right
- [ ] Preview panel shows live updates as you type
- [ ] Photo upload area with drag-and-drop
- [ ] Can upload up to 8 photos
- [ ] Preview shows first photo
- [ ] Completion progress bar updates
- [ ] Form fields: Title, Description, Price, Category, Condition

**Test Actions:**
1. Fill in title - preview updates immediately
2. Enter description - preview shows text
3. Set price - preview displays price
4. Upload photo - preview shows image
5. Click "Create Listing" button
6. Should show beautiful success page with:
   - ✅ Green checkmark animation
   - Stats cards (Price, Photos, Condition)
   - "View Your Listing" button
   - "Create Another" button
   - "Browse Listings" button

---

### 4. Listing Detail Page
Click on any listing from home page

**Expected Results:**
- [ ] Breadcrumb navigation at top
- [ ] Large image gallery on left
- [ ] Thumbnail gallery below (if multiple photos)
- [ ] Listing details on right sidebar (sticky)
- [ ] Price displayed prominently
- [ ] Badges for category, condition, photo count
- [ ] Seller information card with avatar
- [ ] Action buttons:
  - "I'm Interested" (if not owner)
  - "Contact Seller" (if not owner)
  - "Buy Now" (if not owner)
  - "Manage Listing" (if owner)
- [ ] Description section
- [ ] Listing details card (Posted date, Status, etc.)

**Test Actions:**
1. Click thumbnail images - main image should change
2. Click "I'm Interested" - form appears
3. Enter optional message and submit
4. Should show success alert
5. Interest should appear in "Interested Buyers" section
6. Click "Remove Interest" - should remove your interest

---

### 5. My Listings Page
Navigate to: http://localhost:5174/my-listings (must be logged in)

**Expected Results:**
- [ ] Header with "My Listings" title
- [ ] "New Listing" button in top right
- [ ] Three stats cards:
  - Active Listings count
  - Total Value (sum of prices)
  - Sold Items count
- [ ] View toggle buttons (Grid/Table)
- [ ] Grid view shows listing cards
- [ ] Table view shows detailed table with:
  - Thumbnail image
  - Title and description preview
  - Category badge
  - Condition badge
  - Price
  - Status
  - Created date
  - Action buttons (View, Delete)

**Test Actions:**
1. Click Grid/Table toggle - view should switch
2. In grid view, click "View" - goes to listing detail
3. In grid view, click "Delete" - confirms and deletes
4. In table view, all columns display correctly
5. Navigate away and back - page should auto-refresh

---

### 6. Profile Page
Click on your avatar/name in navigation

**Expected Results:**
- [ ] Profile header with large avatar (first letter of name)
- [ ] User name and email displayed
- [ ] School affiliation badge
- [ ] Departure date badge (if set)
- [ ] Three stats boxes:
  - Total Listings
  - Active listings
  - Rating
- [ ] "Edit Profile" button (if own profile)
- [ ] Listings section showing all user's listings
- [ ] Reviews section (if any reviews exist)

**Test Actions:**
1. Click "Edit Profile" - form appears
2. Update name, school affiliation, or departure date
3. Click "Save Changes" - should update
4. Form should close and show updated info

---

### 7. Navigation & Auto-Refresh

**Test Actions:**
1. Go to Home page
2. Click on a listing (goes to detail page)
3. Click browser back button
4. Home page should automatically refresh
5. Listings should reload with latest data

**Expected Results:**
- [ ] Back button works correctly
- [ ] Page refreshes automatically
- [ ] No stale data displayed
- [ ] Loading spinner shows briefly during refresh

---

### 8. Responsive Design

**Test on Different Screen Sizes:**

#### Desktop (1280px+)
- [ ] Two-column layouts work
- [ ] Sidebar is sticky
- [ ] All features visible
- [ ] Navigation shows all links

#### Tablet (768px - 1279px)
- [ ] Layouts adjust to single column
- [ ] Cards stack properly
- [ ] Navigation still accessible

#### Mobile (< 768px)
- [ ] Hamburger menu appears
- [ ] All content stacks vertically
- [ ] Touch-friendly buttons
- [ ] Images scale properly

---

### 9. Domain-Based Features

**Test Domain Filtering:**
1. All listings should be from @lincoln.edu.gh users
2. Only users with same domain see each other's listings
3. New listing notifications go to all domain users

**Test Interest System:**
1. Express interest in a listing
2. Seller should see your name (not "Anonymous")
3. Other users should see "Anonymous User"
4. Seller gets notification

---

### 10. Photo Upload & Display

**Test Photo Features:**
1. Upload photo when creating listing
2. Photo saves to `frontend/public/uploads/listings/`
3. Photo displays in listing card
4. Photo displays in detail page
5. Multiple photos show in gallery
6. Thumbnail navigation works
7. Photos have fallback if missing

---

### 11. Search & Filter

**Test Search:**
1. Type in search box - filters by title/description
2. Results update in real-time
3. Clear search - shows all listings

**Test Filters:**
1. Select category - shows only that category
2. Set min price - filters out cheaper items
3. Set max price - filters out expensive items
4. Combine filters - all filters work together
5. Toggle "Leaving Soon" - shows urgent listings

---

### 12. Error Handling

**Test Error States:**
1. Try accessing listing that doesn't exist
2. Should show "Listing not found" message
3. Try accessing protected route without login
4. Should redirect to login page
5. Network error - should show error message

---

## 🎯 Quick Test Script

Run these commands in order:

```bash
# 1. Check backend is running
curl http://localhost:3000/api/health

# 2. Check listings API
curl http://localhost:3000/api/listings | jq '.listings | length'

# 3. Check frontend is accessible
curl -I http://localhost:5174

# 4. Check database
psql -U equagraine -d teacher_marketplace -c "SELECT COUNT(*) FROM listings;"
```

---

## 🐛 Common Issues & Solutions

### Issue: "Can't see listings"
**Solution:** 
- Check if logged in
- Verify email domain is @lincoln.edu.gh
- Check browser console for errors

### Issue: "Photos not displaying"
**Solution:**
- Check `frontend/public/uploads/listings/` folder exists
- Verify photo files are present
- Check browser network tab for 404 errors

### Issue: "Page not refreshing"
**Solution:**
- Hard refresh browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
- Clear browser cache
- Check if both servers are running

### Issue: "Can't create listing"
**Solution:**
- Verify you're logged in
- Check backend logs for errors
- Verify database connection

---

## ✅ Success Criteria

Your system is working correctly if:
- ✅ All 3 listings display on home page
- ✅ Can create new listing with photos
- ✅ Can view listing details
- ✅ Can express interest in listings
- ✅ My Listings page shows your listings
- ✅ Profile page displays correctly
- ✅ Navigation auto-refreshes
- ✅ Professional design throughout
- ✅ Responsive on all devices
- ✅ No console errors

---

## 📊 Current System Data

**Database Stats:**
- Users: 1 (equagraine@lincoln.edu.gh)
- Listings: 3 active
- Photos: 1 uploaded

**Listings:**
1. "asd" - $1.13 - Furniture - Good - 1 photo
2. "asd" - $1.13 - Furniture - Good - 0 photos
3. "ii" - $0.04 - Other - New - 0 photos

---

## 🚀 Next Steps After Testing

Once all tests pass:
1. Create more test listings with photos
2. Test with multiple users
3. Test all user interactions
4. Verify notifications work
5. Test messaging system
6. Prepare for production deployment

---

## 📞 Need Help?

If any test fails:
1. Check browser console (F12)
2. Check backend logs
3. Verify database connection
4. Check network tab for API errors
5. Let me know which specific test failed

---

**Start Testing Now!**
Open http://localhost:5174 in your browser and go through each test! ✨
