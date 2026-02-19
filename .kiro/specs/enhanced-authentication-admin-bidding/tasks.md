# Implementation Plan: Enhanced Authentication, Admin Dashboard, and Anonymous Bidding

## Overview

This implementation plan covers three major features for the Teacher Marketplace platform: email-only authentication with magic links, comprehensive admin dashboard and management tools, and an anonymous bidding system. The implementation uses TypeScript with Node.js/Express backend, React frontend, and PostgreSQL database.

## Tasks

- [ ] 1. Set up database schema for new features
  - Create bids table with anonymous flag and status tracking
  - Create admin_activity_log table for audit trail
  - Create system_settings table for configuration
  - Modify users table to support email-only authentication
  - Modify listings table to support bidding settings
  - Create indexes for performance optimization
  - Create database triggers for automatic bid tracking
  - _Requirements: 1.1, 2.2, 6.1, 7.1, 8.1, 10.1_

- [ ] 2. Implement magic link authentication backend
  - [ ] 2.1 Create magic link token generation and storage
    - Implement cryptographically secure token generation
    - Create in-memory token store with expiration tracking
    - Add email domain validation for @lincoln.edu.gh
    - _Requirements: 1.1, 1.2, 1.6, 2.1_
  
  - [ ]* 2.2 Write property test for email domain validation
    - **Property 1: Email domain validation**
    - **Validates: Requirements 1.1, 1.6**
  
  - [ ]* 2.3 Write property test for magic link expiration
    - **Property 2: Magic link expiration time**
    - **Validates: Requirements 1.2**
  
  - [ ] 2.4 Implement magic link verification endpoint
    - Validate token exists and not expired
    - Authenticate user and generate JWT
    - Invalidate token after successful use
    - Update user last_login timestamp
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [ ]* 2.5 Write property test for one-time use enforcement
    - **Property 4: One-time use enforcement**
    - **Validates: Requirements 1.4**
  
  - [ ]* 2.6 Write property test for expired token rejection
    - **Property 5: Expired magic link rejection**
    - **Validates: Requirements 1.5**
  
  - [ ] 2.7 Add rate limiting for magic link requests
    - Implement per-email rate limiting
    - Track request counts and time windows
    - _Requirements: 2.5_
  
  - [ ]* 2.8 Write property test for rate limiting
    - **Property 8: Rate limiting**
    - **Validates: Requirements 2.5**

- [ ] 3. Implement admin service layer
  - [ ] 3.1 Create dashboard statistics aggregation
    - Query counts for users, listings, transactions, bids
    - Query flagged content count
    - Fetch recent activity
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 3.2 Write property tests for dashboard statistics
    - **Property 9: User count accuracy**
    - **Property 10: Active listing count accuracy**
    - **Property 11: Transaction count accuracy**
    - **Property 12: Bid count accuracy**
    - **Property 13: Flagged content count accuracy**
    - **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5**
  
  - [ ] 3.3 Implement user management functions
    - Create getAllUsers with pagination
    - Create updateUserRole with validation
    - Create suspendUser with duration tracking
    - Add self-suspension prevention
    - _Requirements: 4.1, 4.2, 4.3, 4.6_
  
  - [ ]* 3.4 Write property tests for user management
    - **Property 15: Role update persistence and logging**
    - **Property 16: Suspension enforcement**
    - **Property 18: Self-suspension prevention**
    - **Validates: Requirements 4.2, 4.3, 4.4, 4.6**
  
  - [ ] 3.5 Implement listing management functions
    - Create getAllListings with filtering
    - Create deleteListing with soft delete
    - Add seller notification on deletion
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [ ]* 3.6 Write property tests for listing management
    - **Property 20: Listing deletion and logging**
    - **Property 21: Flagged content filtering**
    - **Property 23: Listing filtering**
    - **Validates: Requirements 5.2, 5.3, 5.5**
  
  - [ ] 3.7 Implement activity logging system
    - Create logActivity function with IP tracking
    - Create getActivityLog with pagination and filtering
    - Ensure immutability of log entries
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
  
  - [ ]* 3.8 Write property tests for activity logging
    - **Property 24: Activity logging completeness**
    - **Property 26: Activity log ordering**
    - **Property 28: Activity log immutability**
    - **Validates: Requirements 6.1, 6.3, 6.5**
  
  - [ ] 3.9 Implement system settings management
    - Create getSystemSettings function
    - Create updateSystemSetting with validation
    - Add immediate application of settings
    - Log all setting changes
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_
  
  - [ ]* 3.10 Write property tests for system settings
    - **Property 30: Email domain validation and persistence**
    - **Property 31: Bidding settings validation**
    - **Property 33: Settings immediate application**
    - **Validates: Requirements 7.2, 7.4, 7.6**

- [ ] 4. Checkpoint - Ensure admin service tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement bidding service layer
  - [ ] 5.1 Create bid placement function
    - Validate listing exists and bidding enabled
    - Validate not bidding on own listing
    - Validate minimum bid and increment requirements
    - Create bid record with anonymous flag
    - Notify seller of new bid
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 5.2 Write property tests for bid validation
    - **Property 36: Minimum bid validation**
    - **Property 37: Bid increment validation**
    - **Property 38: Self-bidding prevention**
    - **Validates: Requirements 8.3, 8.4, 8.5**
  
  - [ ] 5.3 Implement privacy-aware bid retrieval
    - Create getListingBids with context-aware filtering
    - Implement SQL CASE statements for privacy
    - Filter bidder information based on requester role
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 5.4 Write property tests for bid privacy
    - **Property 40: Anonymous bid privacy for non-sellers**
    - **Property 41: Seller visibility of all bidders**
    - **Property 43: Email privacy enforcement**
    - **Validates: Requirements 9.1, 9.2, 9.4**
  
  - [ ] 5.5 Implement bid management functions
    - Create acceptBid with cascade rejection
    - Create rejectBid with notification
    - Create withdrawBid with status validation
    - Update listing status on bid acceptance
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6_
  
  - [ ]* 5.6 Write property tests for bid management
    - **Property 50: Bid acceptance state change**
    - **Property 52: Bid withdrawal**
    - **Property 53: Cascade rejection on acceptance**
    - **Property 55: Accepted bid withdrawal prevention**
    - **Validates: Requirements 11.1, 11.3, 11.4, 11.6**
  
  - [ ] 5.7 Implement listing bidding controls
    - Add bidding_enabled toggle validation
    - Validate minimum bid and increment requirements
    - Prevent bids on disabled listings
    - Preserve existing bids when settings change
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_
  
  - [ ]* 5.8 Write property tests for bidding controls
    - **Property 45: Minimum bid requirement**
    - **Property 46: Bid increment requirement**
    - **Property 47: Disabled bidding enforcement**
    - **Property 49: Positive bidding values validation**
    - **Validates: Requirements 10.2, 10.3, 10.4, 10.6**

- [ ] 6. Implement API routes and middleware
  - [ ] 6.1 Create auth routes for magic links
    - POST /api/auth/send-magic-link endpoint
    - GET /api/auth/verify-magic-link endpoint
    - Add email domain validation middleware
    - _Requirements: 1.1, 1.3, 1.6_
  
  - [ ] 6.2 Create admin routes with authorization
    - GET /api/admin/dashboard endpoint
    - GET /api/admin/users endpoint with pagination
    - PUT /api/admin/users/:id/role endpoint
    - POST /api/admin/users/:id/suspend endpoint
    - GET /api/admin/listings endpoint with filtering
    - DELETE /api/admin/listings/:id endpoint
    - GET /api/admin/activity-log endpoint
    - GET /api/admin/settings endpoint
    - PUT /api/admin/settings/:key endpoint
    - Add requireAdmin middleware
    - _Requirements: 3.1, 4.1, 4.2, 4.3, 5.1, 5.2, 6.3, 7.1, 7.2_
  
  - [ ] 6.3 Create bidding routes
    - POST /api/bids endpoint
    - GET /api/bids/listings/:id endpoint
    - GET /api/bids/my-bids endpoint
    - POST /api/bids/:id/accept endpoint
    - POST /api/bids/:id/reject endpoint
    - DELETE /api/bids/:id endpoint
    - _Requirements: 8.1, 9.1, 11.1, 11.2, 11.3, 12.4_
  
  - [ ]* 6.4 Write integration tests for API endpoints
    - Test magic link flow end-to-end
    - Test admin authorization and actions
    - Test bidding with privacy filtering
    - _Requirements: 1.1, 1.3, 4.2, 8.1, 9.1_

- [ ] 7. Checkpoint - Ensure backend integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement frontend components
  - [ ] 8.1 Create MagicLinkLoginPage component
    - Email input with domain validation
    - Send magic link button
    - Success/error message display
    - _Requirements: 1.1, 1.6_
  
  - [ ] 8.2 Create MagicLinkVerifyPage component
    - Extract token from URL query params
    - Call verification endpoint
    - Handle success (store JWT, redirect)
    - Handle errors (expired, invalid)
    - _Requirements: 1.3, 1.4, 1.5_
  
  - [ ] 8.3 Create AdminDashboardPage component
    - Display statistics cards
    - Show recent activity feed
    - Add quick action buttons
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ] 8.4 Create admin user management interface
    - User list table with pagination
    - Role update dropdown
    - Suspend user modal with reason input
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [ ] 8.5 Create admin listing management interface
    - Listing table with filters
    - Delete listing modal with reason input
    - Flagged content view
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ] 8.6 Create admin activity log interface
    - Activity log table with pagination
    - Filter controls for action type and date
    - Display admin name, action, and timestamp
    - _Requirements: 6.3, 6.4_
  
  - [ ] 8.7 Create admin settings interface
    - Settings form with validation
    - Email domain input
    - Bidding settings inputs
    - Save button with confirmation
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 8.8 Create BiddingPanel component
    - Bid form with amount input
    - Anonymous toggle checkbox
    - Optional message textarea
    - Bid list with privacy-aware display
    - Accept/reject buttons for sellers
    - Withdraw button for bidders
    - _Requirements: 8.1, 8.2, 9.1, 11.1, 11.2, 11.3_
  
  - [ ]* 8.9 Write frontend component tests
    - Test magic link pages render correctly
    - Test admin dashboard displays stats
    - Test bidding panel privacy filtering
    - _Requirements: 1.1, 3.1, 9.1_

- [ ] 9. Wire components and routes together
  - [ ] 9.1 Add magic link routes to frontend router
    - /auth/magic-link-login route
    - /auth/magic-link route for verification
    - _Requirements: 1.1, 1.3_
  
  - [ ] 9.2 Add admin routes to frontend router
    - /admin/dashboard route with auth guard
    - /admin/users route
    - /admin/listings route
    - /admin/activity route
    - /admin/settings route
    - _Requirements: 3.1, 4.1, 5.1, 6.3, 7.1_
  
  - [ ] 9.3 Integrate BiddingPanel into listing pages
    - Add to listing detail page
    - Show only when bidding enabled
    - Hide from non-authenticated users
    - _Requirements: 8.1, 10.4_
  
  - [ ] 9.4 Update navigation to include admin links
    - Add admin menu item for admin users
    - Add magic link login option
    - _Requirements: 1.1, 3.1_

- [ ] 10. Final checkpoint - End-to-end testing
  - Test complete magic link authentication flow
  - Test admin dashboard and all management functions
  - Test anonymous bidding with multiple users
  - Verify privacy filtering works correctly
  - Ensure all activity is logged properly
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional property-based tests and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across many generated inputs
- Unit tests validate specific examples and edge cases
- The implementation uses TypeScript throughout for type safety
- Database migrations should be run before starting implementation
- Magic link tokens use in-memory storage (consider Redis for production)
- All admin actions are logged for audit trail
- Bidding privacy is enforced at the database query level for security

