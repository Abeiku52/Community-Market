# Implementation Plan: Teacher Marketplace

## Overview

This implementation plan breaks down the Teacher Marketplace platform into discrete coding tasks. The platform will be built using TypeScript with Node.js for the backend API, PostgreSQL for the database, and includes comprehensive testing with both unit tests and property-based tests.

The implementation follows an incremental approach: set up infrastructure first, then build core services (authentication, listings, messaging), add supporting features (transactions, reviews, notifications), and finally implement moderation and administrative features.

## Tasks

- [x] 1. Project setup and infrastructure
  - Initialize TypeScript Node.js project with Express
  - Set up PostgreSQL database connection
  - Configure environment variables and secrets management
  - Set up testing frameworks (Jest for unit tests, fast-check for property tests)
  - Create database schema with all tables and constraints
  - Set up file storage service integration (AWS S3 or compatible)
  - Configure email service integration (SendGrid or SMTP)
  - _Requirements: All requirements depend on this foundation_

- [x] 2. Implement Authentication Service
  - [x] 2.1 Create User model and database operations
    - Define User TypeScript interface and database schema
    - Implement user CRUD operations
    - Add email uniqueness constraint and indexing
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 2.2 Implement registration with email validation
    - Create registration endpoint with school email domain validation
    - Implement bcrypt password hashing
    - Generate and send email verification tokens
    - _Requirements: 1.1, 1.2, 1.5_
  
  - [ ]* 2.3 Write property test for valid registration
    - **Property 1: Valid registration creates account**
    - **Validates: Requirements 1.1**
  
  - [ ]* 2.4 Write property test for invalid email rejection
    - **Property 2: Invalid email domain rejection**
    - **Validates: Requirements 1.2**
  
  - [x] 2.5 Implement login with JWT token generation
    - Create login endpoint with credential validation
    - Generate JWT tokens with user ID and role
    - Implement token expiration (24 hours)
    - _Requirements: 1.3, 1.4_
  
  - [ ]* 2.6 Write property test for authentication round-trip
    - **Property 3: Authentication round-trip**
    - **Validates: Requirements 1.3**
  
  - [ ]* 2.7 Write property test for invalid credentials
    - **Property 4: Invalid credentials rejection**
    - **Validates: Requirements 1.4**
  
  - [x] 2.8 Implement email verification flow
    - Create email verification endpoint
    - Validate verification tokens
    - Update user email_verified status
    - _Requirements: 1.5_
  
  - [ ]* 2.9 Write property test for email verification requirement
    - **Property 5: Email verification requirement**
    - **Validates: Requirements 1.5**
  
  - [ ]* 2.10 Write unit tests for authentication edge cases
    - Test rate limiting on login attempts
    - Test expired tokens
    - Test missing authentication headers
    - _Requirements: 1.3, 1.4_

- [x] 3. Checkpoint - Authentication complete
  - Ensure all authentication tests pass, ask the user if questions arise.

- [x] 4. Implement Listing Service
  - [x] 4.1 Create Listing and ListingPhoto models
    - Define Listing and ListingPhoto TypeScript interfaces
    - Implement database schema with foreign keys and constraints
    - Add indexes for sellerId, status, and category
    - _Requirements: 2.1, 2.2, 2.4, 2.5, 2.6_
  
  - [x] 4.2 Implement listing creation endpoint
    - Create POST /api/listings endpoint
    - Validate required fields (title, description, price, category)
    - Set initial status to active
    - Associate with authenticated seller
    - _Requirements: 2.1, 2.3, 2.6_
  
  - [ ]* 4.3 Write property test for valid listing creation
    - **Property 6: Valid listing creation**
    - **Validates: Requirements 2.1, 2.6**
  
  - [ ]* 4.4 Write property test for required field validation
    - **Property 8: Required field validation**
    - **Validates: Requirements 2.3**
  
  - [ ]* 4.5 Write property test for enum value acceptance
    - **Property 9: Enum value acceptance**
    - **Validates: Requirements 2.4, 2.5**
  
  - [x] 4.6 Implement photo upload functionality
    - Create POST /api/listings/:id/photos endpoint
    - Validate file type (JPEG, PNG) and size (max 5MB)
    - Upload to file storage service
    - Create ListingPhoto record with display order
    - _Requirements: 2.2, 11.1, 11.2, 11.3_
  
  - [ ]* 4.7 Write property test for photo storage and retrieval
    - **Property 7: Photo storage and retrieval**
    - **Validates: Requirements 2.2**
  
  - [ ]* 4.8 Write property test for photo validation
    - **Property 45: Photo validation**
    - **Validates: Requirements 11.2, 11.3**
  
  - [ ]* 4.9 Write property test for photo upload limit
    - **Property 44: Photo upload limit**
    - **Validates: Requirements 11.1**
  
  - [x] 4.10 Implement photo management endpoints
    - Create DELETE /api/listings/:listingId/photos/:photoId endpoint
    - Create PUT /api/listings/:id/photos/reorder endpoint
    - Validate ownership before modifications
    - _Requirements: 11.4, 11.5_
  
  - [ ]* 4.11 Write property tests for photo management
    - **Property 46: Photo reordering**
    - **Property 47: Photo deletion**
    - **Validates: Requirements 11.4, 11.5**

- [x] 5. Implement Listing Browsing and Search
  - [x] 5.1 Create listing search endpoint with filters
    - Implement GET /api/listings with query parameters
    - Add category filter
    - Add price range filter (minPrice, maxPrice)
    - Add text search (title and description)
    - Filter to only active listings
    - Order by creation date (newest first)
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 5.2 Write property test for active listing visibility
    - **Property 10: Active listing visibility**
    - **Validates: Requirements 3.1**
  
  - [ ]* 5.3 Write property test for search matching
    - **Property 11: Search matching**
    - **Validates: Requirements 3.2**
  
  - [ ]* 5.4 Write property test for category filtering
    - **Property 12: Category filtering**
    - **Validates: Requirements 3.3**
  
  - [ ]* 5.5 Write property test for price range filtering
    - **Property 13: Price range filtering**
    - **Validates: Requirements 3.4**
  
  - [x] 5.6 Implement listing detail endpoint
    - Create GET /api/listings/:id endpoint
    - Include all listing fields, photos, and seller information
    - _Requirements: 3.5_
  
  - [ ]* 5.7 Write property test for listing detail completeness
    - **Property 14: Listing detail completeness**
    - **Validates: Requirements 3.5**

- [x] 6. Implement Listing Management
  - [x] 6.1 Create seller listing retrieval endpoint
    - Implement GET /api/users/:id/listings endpoint
    - Return all listings for the specified seller
    - _Requirements: 4.1, 7.3_
  
  - [ ]* 6.2 Write property test for seller listing retrieval
    - **Property 15: Seller listing retrieval**
    - **Validates: Requirements 4.1, 7.3**
  
  - [x] 6.3 Implement listing update endpoint
    - Create PUT /api/listings/:id endpoint
    - Validate ownership (only seller can update)
    - Update listing fields
    - _Requirements: 4.2_
  
  - [ ]* 6.4 Write property test for listing update round-trip
    - **Property 16: Listing update round-trip**
    - **Validates: Requirements 4.2**
  
  - [x] 6.5 Implement listing status management
    - Create POST /api/listings/:id/mark-sold endpoint
    - Create DELETE /api/listings/:id endpoint (soft delete)
    - Create PUT /api/listings/:id/status endpoint for pending status
    - Validate ownership for all operations
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [ ]* 6.6 Write property tests for status transitions
    - **Property 17: Sold status transition**
    - **Property 18: Listing deletion**
    - **Property 19: Pending status transition**
    - **Validates: Requirements 4.3, 4.4, 4.5**

- [x] 7. Checkpoint - Listing functionality complete
  - Ensure all listing tests pass, ask the user if questions arise.

- [x] 8. Implement Messaging Service
  - [x] 8.1 Create Message model and database operations
    - Define Message TypeScript interface
    - Implement database schema with foreign keys
    - Add indexes for conversation retrieval and unread counts
    - _Requirements: 5.1, 5.3, 5.4, 5.5_
  
  - [x] 8.2 Implement send message endpoint
    - Create POST /api/messages endpoint
    - Validate sender, recipient, and listing exist
    - Create message record
    - Trigger notification creation (integrate with notification service)
    - _Requirements: 5.1, 5.2_
  
  - [ ]* 8.3 Write property test for message delivery
    - **Property 20: Message delivery**
    - **Validates: Requirements 5.1, 5.3**
  
  - [x] 8.4 Implement conversation retrieval endpoints
    - Create GET /api/conversations endpoint (list all conversations)
    - Create GET /api/conversations/:listingId/:otherUserId endpoint (specific thread)
    - Mark messages as read when retrieved
    - Order messages by timestamp
    - _Requirements: 5.4, 5.5_
  
  - [ ]* 8.5 Write property test for conversation threading
    - **Property 22: Conversation thread grouping**
    - **Validates: Requirements 5.4**
  
  - [ ]* 8.6 Write property test for unread count accuracy
    - **Property 23: Unread message count accuracy**
    - **Validates: Requirements 5.5**
  
  - [x] 8.7 Implement mark as read endpoint
    - Create PUT /api/messages/:id/read endpoint
    - Validate user is recipient
    - Update isRead status
    - _Requirements: 5.5_

- [x] 9. Implement Notification Service
  - [x] 9.1 Create Notification and NotificationPreference models
    - Define TypeScript interfaces for both models
    - Implement database schemas
    - Add indexes for userId and isRead
    - Create default notification preferences on user registration
    - _Requirements: 5.2, 12.1, 12.2, 12.3, 12.4, 12.5_
  
  - [x] 9.2 Implement notification creation functions
    - Create function to send email notifications via email service
    - Create function to create in-app notifications
    - Check user preferences before sending
    - Handle email service failures gracefully (queue for retry)
    - _Requirements: 5.2, 12.1, 12.2, 12.3_
  
  - [ ]* 9.3 Write property test for message notification creation
    - **Property 21: Message notification creation**
    - **Validates: Requirements 5.2, 12.1, 12.2, 12.3**
  
  - [x] 9.4 Implement notification preference endpoints
    - Create GET /api/users/profile/notification-preferences endpoint
    - Create PUT /api/users/profile/notification-preferences endpoint
    - _Requirements: 12.4_
  
  - [ ]* 9.5 Write property test for notification preference respect
    - **Property 48: Notification preference respect**
    - **Validates: Requirements 12.4**
  
  - [x] 9.6 Implement notification retrieval endpoints
    - Create GET /api/users/profile/notifications endpoint
    - Create PUT /api/notifications/:id/read endpoint
    - Filter by read/unread status
    - _Requirements: 5.2_
  
  - [x] 9.7 Implement departure date reminder job
    - Create scheduled job to find users with departure date within 7 days
    - Send reminder notifications
    - Run daily
    - _Requirements: 12.5_
  
  - [ ]* 9.8 Write property test for departure reminder
    - **Property 49: Departure reminder notification**
    - **Validates: Requirements 12.5**

- [x] 10. Implement Transaction Service
  - [x] 10.1 Create Transaction model and database operations
    - Define Transaction TypeScript interface
    - Implement database schema with foreign keys
    - Add unique constraint on listingId
    - Add indexes for buyerId and sellerId
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [x] 10.2 Implement transaction creation endpoint
    - Create POST /api/transactions endpoint
    - Validate listing is active
    - Create transaction with pending status
    - Update listing status to pending
    - _Requirements: 6.1_
  
  - [ ]* 10.3 Write property test for transaction creation
    - **Property 24: Transaction creation**
    - **Validates: Requirements 6.1**
  
  - [x] 10.4 Implement transaction completion endpoint
    - Create PUT /api/transactions/:id/complete endpoint
    - Validate user is seller
    - Update transaction status to completed
    - Update listing status to sold
    - Record completion timestamp and buyer information
    - _Requirements: 6.2, 6.3_
  
  - [ ]* 10.5 Write property test for transaction completion
    - **Property 25: Transaction completion**
    - **Validates: Requirements 6.2, 6.3**
  
  - [x] 10.6 Implement transaction cancellation endpoint
    - Create PUT /api/transactions/:id/cancel endpoint
    - Validate user is buyer or seller
    - Update transaction status to cancelled
    - Restore listing status to active
    - _Requirements: 6.5_
  
  - [ ]* 10.7 Write property test for transaction cancellation
    - **Property 27: Transaction cancellation round-trip**
    - **Validates: Requirements 6.5**
  
  - [x] 10.8 Implement transaction history endpoint
    - Create GET /api/transactions/history endpoint
    - Return all transactions where user is buyer or seller
    - Order by creation date (newest first)
    - _Requirements: 6.4_
  
  - [ ]* 10.9 Write property test for transaction history
    - **Property 26: Transaction history persistence**
    - **Validates: Requirements 6.4**

- [x] 11. Checkpoint - Core marketplace functionality complete
  - Ensure all tests pass, ask the user if questions arise.

- [x] 12. Implement Review Service
  - [x] 12.1 Create Review model and database operations
    - Define Review TypeScript interface
    - Implement database schema with foreign keys
    - Add unique constraint on transactionId
    - Add index for revieweeId
    - Add check constraint for rating (1-5)
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [x] 12.2 Implement review creation endpoint
    - Create POST /api/reviews endpoint
    - Validate transaction is completed
    - Validate reviewer is buyer
    - Validate rating is 1-5
    - Create review record
    - Trigger notification to seller
    - _Requirements: 8.1, 8.2, 8.5_
  
  - [ ]* 12.3 Write property test for review creation
    - **Property 30: Review creation after transaction**
    - **Validates: Requirements 8.1, 8.2**
  
  - [ ]* 12.4 Write property test for review notification
    - **Property 33: Review notification**
    - **Validates: Requirements 8.5**
  
  - [x] 12.5 Implement review retrieval and rating calculation
    - Create GET /api/users/:id/reviews endpoint
    - Calculate average rating from all reviews
    - Return reviews and average rating
    - _Requirements: 8.3, 8.4_
  
  - [ ]* 12.6 Write property test for review visibility
    - **Property 31: Review visibility**
    - **Validates: Requirements 8.3**
  
  - [ ]* 12.7 Write property test for average rating calculation
    - **Property 32: Average rating calculation**
    - **Validates: Requirements 8.4**

- [x] 13. Implement User Profile Service
  - [x] 13.1 Implement user profile retrieval endpoint
    - Create GET /api/users/:id endpoint
    - Include name, school affiliation, join date
    - Include active listings
    - Include reviews and average rating
    - _Requirements: 7.1, 7.3, 7.4, 7.5_
  
  - [ ]* 13.2 Write property test for profile data completeness
    - **Property 28: Profile data completeness**
    - **Validates: Requirements 7.1, 7.4, 7.5**
  
  - [x] 13.3 Implement profile update endpoint
    - Create PUT /api/users/profile endpoint
    - Allow updating name, school affiliation, departure date
    - Validate authenticated user
    - _Requirements: 7.2, 10.1_
  
  - [ ]* 13.4 Write property test for profile update
    - **Property 29: Profile update round-trip**
    - **Validates: Requirements 7.2**
  
  - [ ]* 13.5 Write property test for departure date storage
    - **Property 39: Departure date storage**
    - **Validates: Requirements 10.1**

- [x] 14. Implement Departure Date Features
  - [x] 14.1 Add departure date display to listing responses
    - Modify listing serialization to include seller's departure date
    - _Requirements: 10.2_
  
  - [ ]* 14.2 Write property test for departure date display
    - **Property 40: Departure date display on listings**
    - **Validates: Requirements 10.2**
  
  - [x] 14.3 Implement urgency indicator logic
    - Add computed field to check if departure date is within 30 days
    - Include urgency indicator in listing responses
    - _Requirements: 10.3_
  
  - [ ]* 14.4 Write property test for urgency indicator
    - **Property 41: Urgency indicator display**
    - **Validates: Requirements 10.3**
  
  - [x] 14.5 Add leaving soon filter to search
    - Modify GET /api/listings to accept leavingSoon query parameter
    - Filter listings where seller's departure date is within 30 days
    - _Requirements: 10.4_
  
  - [ ]* 14.6 Write property test for leaving soon filter
    - **Property 42: Leaving soon filter**
    - **Validates: Requirements 10.4**
  
  - [x] 14.7 Implement automatic listing expiration job
    - Create scheduled job to find listings where seller's departure date has passed
    - Update listing status to expired
    - Run daily
    - _Requirements: 10.5_
  
  - [ ]* 14.8 Write property test for automatic expiration
    - **Property 43: Automatic expiration**
    - **Validates: Requirements 10.5**

- [x] 15. Implement Moderation Service
  - [x] 15.1 Create Flag and UserSuspension models
    - Define TypeScript interfaces for both models
    - Implement database schemas with foreign keys
    - Add index for flag status
    - Add index for user suspension expiration
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [x] 15.2 Implement flag listing endpoint
    - Create POST /api/moderation/flag endpoint
    - Create flag record
    - Notify all admin users
    - _Requirements: 9.5_
  
  - [ ]* 15.3 Write property test for flag notification
    - **Property 38: Flag notification**
    - **Validates: Requirements 9.5**
  
  - [x] 15.4 Implement admin flagged listings endpoint
    - Create GET /api/moderation/flagged endpoint (admin only)
    - Return all flagged listings pending review
    - Validate user has admin role
    - _Requirements: 9.4_
  
  - [x] 15.5 Implement admin review endpoint
    - Create POST /api/moderation/review endpoint (admin only)
    - Accept action: hide, delete, or restore
    - Update listing status based on action
    - Update flag status to reviewed
    - Notify listing owner
    - _Requirements: 9.1, 9.2_
  
  - [ ]* 15.6 Write property test for listing hiding
    - **Property 34: Listing hiding on flag**
    - **Validates: Requirements 9.1**
  
  - [ ]* 15.7 Write property test for admin moderation actions
    - **Property 35: Admin moderation actions**
    - **Validates: Requirements 9.2**
  
  - [x] 15.8 Implement user suspension endpoint
    - Create POST /api/moderation/suspend-user endpoint (admin only)
    - Create UserSuspension record
    - Validate user has admin role
    - Notify suspended user
    - _Requirements: 9.3_
  
  - [x] 15.9 Add suspension check middleware
    - Create middleware to check if user is suspended
    - Block suspended users from creating listings, sending messages, etc.
    - Apply to relevant endpoints
    - _Requirements: 9.3_
  
  - [ ]* 15.10 Write property test for user suspension
    - **Property 36: User suspension**
    - **Validates: Requirements 9.3**
  
  - [ ]* 15.11 Write property test for admin visibility
    - **Property 37: Admin visibility**
    - **Validates: Requirements 9.4**

- [x] 16. Implement Authorization Middleware
  - [x] 16.1 Create JWT verification middleware
    - Extract and verify JWT tokens from Authorization header
    - Attach user information to request object
    - Handle expired and invalid tokens
    - _Requirements: 1.3, 1.4_
  
  - [x] 16.2 Create ownership validation middleware
    - Verify user owns the resource they're trying to modify
    - Apply to listing update/delete endpoints
    - Apply to photo management endpoints
    - _Requirements: 4.2, 4.3, 4.4, 11.4, 11.5_
  
  - [x] 16.3 Create admin role middleware
    - Verify user has admin role
    - Apply to all moderation endpoints
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 16.4 Write unit tests for authorization middleware
    - Test valid token acceptance
    - Test invalid token rejection
    - Test ownership validation
    - Test admin role validation
    - _Requirements: 1.3, 1.4, 9.1, 9.2, 9.3, 9.4_

- [x] 17. Implement Error Handling
  - [x] 17.1 Create global error handler middleware
    - Catch all errors from route handlers
    - Format errors according to specification
    - Log errors with appropriate details
    - Return appropriate HTTP status codes
    - _Requirements: All requirements (error handling)_
  
  - [x] 17.2 Create custom error classes
    - ValidationError (400)
    - UnauthorizedError (401)
    - ForbiddenError (403)
    - NotFoundError (404)
    - ConflictError (409)
    - _Requirements: All requirements (error handling)_
  
  - [ ]* 17.3 Write unit tests for error handling
    - Test each error type returns correct status code
    - Test error response format
    - Test error logging
    - _Requirements: All requirements (error handling)_

- [x] 18. Final Integration and Testing
  - [x] 18.1 Write integration tests for complete user flows
    - Test complete listing flow (register → create listing → upload photos)
    - Test complete purchase flow (search → message → transaction → review)
    - Test moderation flow (report → admin review → action)
    - Test departure flow (set date → urgency → expiration)
    - _Requirements: All requirements_
  
  - [x] 18.2 Set up API documentation
    - Document all endpoints with request/response examples
    - Include authentication requirements
    - Include error responses
    - _Requirements: All requirements_
  
  - [x] 18.3 Performance testing and optimization
    - Test with large datasets (10,000+ listings)
    - Verify database indexes are used
    - Optimize slow queries
    - Test concurrent user scenarios
    - _Requirements: All requirements_

- [x] 19. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at major milestones
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples, edge cases, and error conditions
- All property tests must be tagged with: `Feature: teacher-marketplace, Property {number}: {property_text}`
- The implementation uses TypeScript with Node.js, Express, PostgreSQL, and fast-check for property-based testing
