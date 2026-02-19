# Domain-Based Features Testing Guide

## Overview
This guide will help you test all the newly implemented domain-based features in LincolnMarket.

## Prerequisites

1. **Backend Running**: `npm run dev` (Port 3000)
2. **Frontend Running**: `cd frontend && npm run dev` (Port 5174)
3. **Database**: PostgreSQL with `teacher_marketplace` database
4. **Test Users**: At least 2-3 users with @lincoln.edu.gh emails

## Test Scenarios

### 1. Domain-Based Visibility Test

**Objective**: Verify users only see listings from their own domain

**Steps**:
1. Create User A with email: `usera@lincoln.edu.gh`
2. Create User B with email: `userb@lincoln.edu.gh`
3. Create User C with email: `userc@otherschool.com` (if you want to test cross-domain)
4. Log in as User A and create a listing (e.g., "Math Textbook")
5. Log out and log in as User B
6. Browse listings - you SHOULD see User A's "Math Textbook" listing
7. Log out and log in as User C (if created)
8. Browse listings - you SHOULD NOT see User A's listing

**Expected Results**:
- ✅ Users with same domain see each other's listings
- ✅ Users with different domains don't see each other's listings
- ✅ Listings are filtered automatically without user action

---

### 2. New Listing Notifications Test

**Objective**: Verify all domain users get notified when someone posts a listing

**Steps**:
1. Ensure you have User A and User B both with @lincoln.edu.gh emails
2. Log in as User B and check notifications (should be empty or have old ones)
3. Log out and log in as User A
4. Create a new listing (e.g., "Science Lab Equipment - $50")
5. Log out and log in as User B
6. Check notifications - you SHOULD see a notification about User A's new listing

**Expected Results**:
- ✅ User B receives notification: "New listing: Science Lab Equipment in your community"
- ✅ Notification includes listing title and price
- ✅ User A (the seller) does NOT receive a notification about their own listing
- ✅ Notification appears immediately after listing creation

---

### 3. Interest Expression Test

**Objective**: Verify users can express interest in listings

**Steps**:
1. Log in as User A and create a listing (e.g., "Desk Lamp - $15")
2. Log out and log in as User B
3. Navigate to User A's "Desk Lamp" listing detail page
4. Click the "I'm Interested" button
5. Optionally add a message like "Is this still available?"
6. Click "Express Interest"
7. Verify the button changes to "Remove Interest"
8. Try clicking "I'm Interested" again - should show error

**Expected Results**:
- ✅ "I'm Interested" button is visible to non-owners
- ✅ After expressing interest, button changes to "Remove Interest"
- ✅ Cannot express interest twice in the same listing
- ✅ Optional message is saved with the interest
- ✅ Success message appears after expressing interest

---

### 4. Seller Interest Notification Test

**Objective**: Verify sellers get notified when someone shows interest

**Steps**:
1. Continue from Test 3 (User B expressed interest in User A's listing)
2. Log out and log in as User A
3. Check notifications
4. You SHOULD see a notification: "User B is interested in your listing: Desk Lamp"

**Expected Results**:
- ✅ Seller receives notification immediately
- ✅ Notification shows interested user's name
- ✅ Notification includes listing title
- ✅ Notification links to the listing (if implemented)

---

### 5. Anonymous Bidding Test

**Objective**: Verify interested users are anonymous to non-sellers

**Steps**:
1. Ensure User B has expressed interest in User A's listing
2. Create User C with @lincoln.edu.gh email
3. Log in as User C
4. Navigate to User A's listing detail page
5. Scroll to "Interested Users" section
6. You SHOULD see "1 person is interested" with name "Anonymous User"
7. Log out and log in as User A (the seller)
8. Navigate to your own listing
9. You SHOULD see "1 person is interested" with name "User B" (actual name)

**Expected Results**:
- ✅ Non-sellers see "Anonymous User" for interested users
- ✅ Seller sees actual names and emails of interested users
- ✅ Interest count is visible to everyone
- ✅ Messages from interested users are visible to seller only

---

### 6. Interest Removal Test

**Objective**: Verify users can remove their interest

**Steps**:
1. Log in as User B (who expressed interest earlier)
2. Navigate to the listing where you expressed interest
3. Click "Remove Interest" button
4. Verify the button changes back to "I'm Interested"
5. Verify interest count decreases
6. Log in as User A (seller) and verify User B no longer appears in interested users

**Expected Results**:
- ✅ "Remove Interest" button works correctly
- ✅ Interest is removed from database
- ✅ Button changes back to "I'm Interested"
- ✅ User can express interest again after removal
- ✅ Interest count updates correctly

---

### 7. Multiple Interests Test

**Objective**: Verify multiple users can express interest in the same listing

**Steps**:
1. Create User B, User C, and User D (all with @lincoln.edu.gh)
2. Log in as User A and create a listing
3. Log in as User B and express interest
4. Log in as User C and express interest
5. Log in as User D and express interest
6. Log in as User A and view the listing
7. You SHOULD see "3 people are interested" with all three names visible

**Expected Results**:
- ✅ Multiple users can express interest in same listing
- ✅ Interest count shows correct number
- ✅ Seller sees all interested users with actual names
- ✅ Each interested user listed with timestamp
- ✅ Messages from each user are displayed (if provided)

---

### 8. Edge Cases Test

**Objective**: Test edge cases and error handling

**Test Cases**:

**A. Cannot express interest in own listing**
1. Log in as User A
2. Navigate to your own listing
3. "I'm Interested" button should NOT be visible

**B. Must be logged in to express interest**
1. Log out
2. Navigate to any listing
3. "I'm Interested" button should NOT be visible or should prompt login

**C. Cannot express interest in sold/deleted listings**
1. Create a listing and mark it as sold
2. Try to express interest - should show error or button disabled

**D. Interest persists across sessions**
1. Express interest in a listing
2. Log out and log back in
3. Navigate to the listing
4. Should still show "Remove Interest" button

**Expected Results**:
- ✅ All edge cases handled gracefully
- ✅ Appropriate error messages shown
- ✅ No crashes or unexpected behavior

---

## Quick Test Checklist

Use this checklist for rapid testing:

- [ ] Domain filtering works (same domain sees listings)
- [ ] Cross-domain filtering works (different domain doesn't see listings)
- [ ] New listing notifications sent to all domain users
- [ ] Seller doesn't get notification for own listing
- [ ] "I'm Interested" button appears for non-owners
- [ ] Interest expression creates notification for seller
- [ ] Interest count displays correctly
- [ ] Anonymous display works for non-sellers
- [ ] Actual names shown to seller
- [ ] "Remove Interest" button works
- [ ] Cannot express interest twice
- [ ] Cannot express interest in own listing
- [ ] Multiple users can express interest in same listing
- [ ] Messages with interests are saved and displayed

---

## Troubleshooting

### Issue: Listings not filtered by domain
**Solution**: Check that user is authenticated and email domain is being extracted correctly in `listingRoutes.ts`

### Issue: Notifications not appearing
**Solution**: 
1. Check notification service is running
2. Verify notification types are added to enum
3. Check database for notification records

### Issue: "Anonymous User" not showing
**Solution**: Verify `getListingInterests` is checking `viewerId === listing.sellerId` correctly

### Issue: Cannot express interest
**Solution**:
1. Check user is authenticated
2. Verify listing exists and is active
3. Check database constraints (unique listing_id, user_id)

---

## Database Verification

To verify data in the database:

```sql
-- Check listing interests
SELECT 
  li.*,
  u.name as user_name,
  l.title as listing_title
FROM listing_interests li
JOIN users u ON li.user_id = u.id
JOIN listings l ON li.listing_id = l.id;

-- Check notifications
SELECT 
  n.*,
  u.name as user_name
FROM notifications n
JOIN users u ON n.user_id = u.id
WHERE n.type IN ('new_listing', 'listing_interest')
ORDER BY n.created_at DESC;

-- Check users by domain
SELECT 
  email,
  name,
  SUBSTRING(email FROM POSITION('@' IN email) + 1) as domain
FROM users
WHERE email_verified = true;
```

---

## Success Criteria

All features are working correctly if:

1. ✅ Users only see listings from their email domain
2. ✅ All domain users receive notifications for new listings
3. ✅ Sellers receive notifications when users express interest
4. ✅ Interested users appear as "Anonymous" to non-sellers
5. ✅ Sellers see actual names of interested users
6. ✅ Users can express and remove interest successfully
7. ✅ No duplicate interests allowed
8. ✅ All edge cases handled gracefully

---

## Next Steps After Testing

Once all tests pass:
1. Document any bugs found
2. Test with real user scenarios
3. Consider adding email notifications (currently in-app only)
4. Add notification panel UI if not already present
5. Consider adding interest analytics for sellers

---

## Support

If you encounter issues during testing:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify database schema is up to date
4. Ensure all services are running
5. Check that users have verified emails (@lincoln.edu.gh)
