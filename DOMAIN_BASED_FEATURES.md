# Domain-Based Features Implementation

## Overview
Implementing domain-based visibility, notifications, and anonymous bidding system.

## Features to Implement

### 1. Domain-Based Visibility
**Requirement:** Users only see listings from people with the same email domain
**Implementation:**
- Extract domain from user email (e.g., @lincoln.edu.gh)
- Filter listings in search/browse to only show same-domain listings
- Update `searchListings()` to include domain filter
- Add domain column or extract from email in queries

### 2. New Listing Notifications
**Requirement:** When someone posts a listing, all users with same domain get notified
**Implementation:**
- After creating listing, get all users with same domain
- Create notifications for each user (except the seller)
- Send notification: "New listing: [Title] posted by [Name]"
- Add new notification type: `NEW_LISTING`

### 3. Bid/Interest Notifications
**Requirement:** Seller gets notified when someone shows interest
**Implementation:**
- Add "I'm Interested" button on listing detail page
- Create interest/bid record in database
- Notify seller: "[Name] is interested in your listing: [Title]"
- Add new notification type: `LISTING_INTEREST`

### 4. Anonymous Bidding
**Requirement:** Public sees "Anonymous" but seller sees actual buyer
**Implementation:**
- When displaying interested users, check if viewer is the seller
- If seller: show actual name
- If not seller: show "Anonymous User"
- Update listing detail API to include interested users
- Add privacy flag to user display

## Database Changes Needed

### New Table: listing_interests
```sql
CREATE TABLE listing_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  user_id UUID NOT NULL REFERENCES users(id),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(listing_id, user_id)
);
```

### Update notifications table
Add new notification types:
- `new_listing` - Someone in your domain posted a listing
- `listing_interest` - Someone is interested in your listing

## API Endpoints to Add/Update

### POST /api/listings/:id/interest
- Create interest record
- Notify seller
- Return success

### GET /api/listings/:id/interests
- Get all interested users for a listing
- Anonymize if viewer is not seller
- Return list of interests

### GET /api/listings (UPDATE)
- Add domain filter
- Only return listings from same domain

## Frontend Changes

### ListingDetailPage
- Add "I'm Interested" button
- Show interested users list
- Display as "Anonymous" or actual name based on viewer

### HomePage
- Listings automatically filtered by domain
- Show notification when new listing is posted

### Notifications
- Handle new notification types
- Link to listing from notification

## Implementation Steps

1. ✅ Create migration for listing_interests table
2. ✅ Update notification types enum
3. ✅ Add domain extraction utility
4. ✅ Update listingService.searchListings() with domain filter
5. ✅ Create listingService.createInterest()
6. ✅ Create listingService.getInterests()
7. ✅ Update notificationService for new types
8. ✅ Add interest routes
9. ✅ Update frontend ListingDetailPage
10. ✅ Update frontend API service

## All Features Implemented! ✅

All domain-based features have been successfully implemented and are ready for testing.

## Security Considerations

- Verify user can only create one interest per listing
- Verify only seller can see actual interested user names
- Verify domain matching is case-insensitive
- Prevent spam interests

## Testing Checklist

- [ ] Users with different domains don't see each other's listings
- [ ] Users with same domain see all listings
- [ ] New listing creates notifications for all domain users
- [ ] Interest button works and notifies seller
- [ ] Seller sees actual names, others see "Anonymous"
- [ ] Can't create duplicate interests
- [ ] Notifications link correctly to listings
