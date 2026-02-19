# Teacher Marketplace API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Authentication Endpoints

### Register
**POST** `/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "teacher@school.edu",
  "password": "Password123",
  "name": "John Doe",
  "schoolAffiliation": "International School"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "teacher@school.edu",
    "name": "John Doe",
    "schoolAffiliation": "International School",
    "role": "teacher",
    "emailVerified": false
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

### Login
**POST** `/auth/login`

Authenticate and receive a JWT token.

**Request Body:**
```json
{
  "email": "teacher@school.edu",
  "password": "Password123"
}
```

**Response:** `200 OK`
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "uuid",
    "email": "teacher@school.edu",
    "name": "John Doe",
    "role": "teacher",
    "emailVerified": true
  }
}
```

### Verify Email
**POST** `/auth/verify-email`

Verify email address using token from email.

**Request Body:**
```json
{
  "token": "verification_token"
}
```

---

## Listing Endpoints

### Search Listings
**GET** `/listings`

Search and filter listings.

**Query Parameters:**
- `category` - Filter by category (furniture, electronics, books, household, clothing, other)
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Text search in title/description
- `leavingSoon` - Filter sellers leaving within 30 days (true/false)

**Response:** `200 OK`
```json
{
  "listings": [
    {
      "id": "uuid",
      "title": "Sofa for sale",
      "description": "Comfortable 3-seater sofa",
      "price": 150.00,
      "category": "furniture",
      "condition": "good",
      "status": "active",
      "photos": [],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### Get Listing Details
**GET** `/listings/:id`

Get detailed information about a specific listing.

**Response:** `200 OK`
```json
{
  "listing": {
    "id": "uuid",
    "title": "Sofa for sale",
    "description": "Comfortable 3-seater sofa",
    "price": 150.00,
    "category": "furniture",
    "condition": "good",
    "status": "active",
    "photos": [],
    "sellerName": "John Doe",
    "sellerEmail": "teacher@school.edu",
    "sellerDepartureDate": "2024-06-30",
    "isUrgent": true,
    "daysUntilDeparture": 25,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Create Listing
**POST** `/listings`

Create a new listing. Requires authentication and email verification.

**Request Body:**
```json
{
  "title": "Sofa for sale",
  "description": "Comfortable 3-seater sofa in good condition",
  "price": 150.00,
  "category": "furniture",
  "condition": "good"
}
```

**Response:** `201 Created`

### Update Listing
**PUT** `/listings/:id`

Update an existing listing. Only the owner can update.

### Delete Listing
**DELETE** `/listings/:id`

Soft delete a listing. Only the owner can delete.

### Mark as Sold
**POST** `/listings/:id/mark-sold`

Mark a listing as sold.

**Request Body:**
```json
{
  "buyerId": "buyer_uuid"
}
```

---

## Photo Endpoints

### Upload Photo
**POST** `/listings/:id/photos`

Upload a photo to a listing (max 8 photos, 5MB each).

**Request:** `multipart/form-data`
- `file` - Image file (JPEG or PNG)

### Delete Photo
**DELETE** `/listings/:listingId/photos/:photoId`

Delete a photo from a listing.

### Reorder Photos
**PUT** `/listings/:id/photos/reorder`

Change the order of photos.

**Request Body:**
```json
{
  "photoOrder": ["photo_uuid_1", "photo_uuid_2", "photo_uuid_3"]
}
```

---

## Messaging Endpoints

### Send Message
**POST** `/messages`

Send a message about a listing.

**Request Body:**
```json
{
  "listingId": "listing_uuid",
  "recipientId": "recipient_uuid",
  "content": "Is this still available?"
}
```

### Get Conversations
**GET** `/messages/conversations`

Get all conversations for the current user.

### Get Specific Conversation
**GET** `/messages/conversations/:listingId/:otherUserId`

Get messages in a specific conversation.

### Mark as Read
**PUT** `/messages/:id/read`

Mark a message as read.

---

## Transaction Endpoints

### Create Transaction
**POST** `/transactions`

Create a transaction for a listing.

**Request Body:**
```json
{
  "listingId": "listing_uuid",
  "sellerId": "seller_uuid"
}
```

### Complete Transaction
**PUT** `/transactions/:id/complete`

Mark a transaction as completed (seller only).

### Cancel Transaction
**PUT** `/transactions/:id/cancel`

Cancel a transaction (buyer or seller).

### Get Transaction History
**GET** `/transactions/history/all`

Get all transactions for the current user.

---

## Review Endpoints

### Create Review
**POST** `/reviews`

Create a review after a completed transaction.

**Request Body:**
```json
{
  "transactionId": "transaction_uuid",
  "revieweeId": "seller_uuid",
  "rating": 5,
  "comment": "Great seller, item as described!"
}
```

### Get User Reviews
**GET** `/reviews/users/:id`

Get all reviews and average rating for a user.

**Response:**
```json
{
  "userId": "uuid",
  "averageRating": 4.5,
  "totalReviews": 10,
  "reviews": []
}
```

---

## User Profile Endpoints

### Get User Profile
**GET** `/users/:id`

Get public profile of a user with listings and reviews.

### Get Current User Profile
**GET** `/users/profile/me`

Get the current authenticated user's profile.

### Update Profile
**PUT** `/users/profile`

Update the current user's profile.

**Request Body:**
```json
{
  "name": "John Doe",
  "schoolAffiliation": "International School",
  "departureDate": "2024-06-30"
}
```

### Get User's Listings
**GET** `/users/:id/listings`

Get all listings for a specific user.

---

## Notification Endpoints

### Get Notifications
**GET** `/notifications`

Get notifications for the current user.

**Query Parameters:**
- `unreadOnly` - Only return unread notifications (true/false)

### Get Unread Count
**GET** `/notifications/unread-count`

Get count of unread notifications.

### Mark as Read
**PUT** `/notifications/:id/read`

Mark a notification as read.

### Mark All as Read
**PUT** `/notifications/mark-all-read`

Mark all notifications as read.

### Get Preferences
**GET** `/notifications/preferences`

Get notification preferences.

### Update Preferences
**PUT** `/notifications/preferences`

Update notification preferences.

**Request Body:**
```json
{
  "emailNewMessage": true,
  "emailListingInquiry": true,
  "inAppNewMessage": true,
  "inAppListingInquiry": true
}
```

---

## Moderation Endpoints (Admin Only)

### Flag Listing
**POST** `/moderation/flag`

Flag a listing for review (any authenticated user).

**Request Body:**
```json
{
  "listingId": "listing_uuid",
  "reason": "Inappropriate content"
}
```

### Get Flagged Listings
**GET** `/moderation/flagged`

Get all flagged listings pending review (admin only).

### Review Flag
**POST** `/moderation/review`

Review a flagged listing (admin only).

**Request Body:**
```json
{
  "flagId": "flag_uuid",
  "action": "hide"
}
```

Actions: `hide`, `delete`, `restore`

### Suspend User
**POST** `/moderation/suspend-user`

Suspend a user account (admin only).

**Request Body:**
```json
{
  "userId": "user_uuid",
  "reason": "Policy violation",
  "durationDays": 7
}
```

---

## Error Responses

All endpoints return errors in the following format:

```json
{
  "error": "Error message here"
}
```

**Common Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production.
