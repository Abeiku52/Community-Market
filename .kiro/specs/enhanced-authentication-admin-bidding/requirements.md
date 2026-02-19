# Requirements Document

## Introduction

This document specifies requirements for three major enhancements to the Teacher Marketplace platform: email-only authentication with magic links for @lincoln.edu.gh users, a comprehensive admin dashboard for platform management, and an anonymous bidding system for marketplace listings. These features enhance security, provide administrative control, and enable flexible pricing through bidding while maintaining user privacy.

## Glossary

- **Magic_Link**: A time-limited, one-time use URL sent via email that authenticates a user without requiring a password
- **Auth_System**: The authentication and authorization system managing user login and access control
- **Admin_Panel**: The administrative interface for platform management and oversight
- **Bidding_System**: The system managing anonymous bids on marketplace listings
- **Seller**: A user who has created a marketplace listing
- **Bidder**: A user who places a bid on a marketplace listing
- **Activity_Log**: A record of all administrative actions with timestamps and IP tracking
- **System_Settings**: Configurable platform parameters managed by administrators
- **Bid_Increment**: The minimum amount by which a new bid must exceed the current highest bid
- **Anonymous_Bid**: A bid where the bidder's identity is hidden from all users except the seller

## Requirements

### Requirement 1: Email-Only Authentication

**User Story:** As a user with a @lincoln.edu.gh email address, I want to log in using magic links sent to my email, so that I can access the platform securely without managing passwords.

#### Acceptance Criteria

1. WHEN a user with a @lincoln.edu.gh email address requests a magic link, THE Auth_System SHALL validate the email domain and send a unique magic link to that address
2. WHEN a magic link is generated, THE Auth_System SHALL set an expiration time of 15 minutes from creation
3. WHEN a user clicks a valid magic link within 15 minutes, THE Auth_System SHALL authenticate the user and create a session
4. WHEN a magic link is used once, THE Auth_System SHALL invalidate it to prevent reuse
5. WHEN a magic link has expired, THE Auth_System SHALL reject authentication attempts and return an error message
6. WHEN a user attempts to request a magic link with a non-@lincoln.edu.gh email, THE Auth_System SHALL reject the request with a domain validation error
7. THE Auth_System SHALL support both password-based and magic link authentication methods simultaneously

### Requirement 2: Magic Link Security

**User Story:** As a security-conscious user, I want magic links to be secure and time-limited, so that unauthorized access to my account is prevented.

#### Acceptance Criteria

1. WHEN a magic link is generated, THE Auth_System SHALL create a cryptographically secure random token
2. WHEN storing magic link tokens, THE Auth_System SHALL hash them before database storage
3. WHEN validating a magic link, THE Auth_System SHALL verify both the token validity and expiration time
4. WHEN a magic link authentication fails, THE Auth_System SHALL log the attempt with timestamp and IP address
5. THE Auth_System SHALL prevent brute force attacks by rate limiting magic link requests per email address

### Requirement 3: Admin Dashboard Overview

**User Story:** As an administrator, I want to view platform statistics and activity at a glance, so that I can monitor the health and usage of the marketplace.

#### Acceptance Criteria

1. WHEN an administrator accesses the dashboard, THE Admin_Panel SHALL display the total count of registered users
2. WHEN an administrator accesses the dashboard, THE Admin_Panel SHALL display the total count of active listings
3. WHEN an administrator accesses the dashboard, THE Admin_Panel SHALL display the total count of completed transactions
4. WHEN an administrator accesses the dashboard, THE Admin_Panel SHALL display the total count of active bids
5. WHEN an administrator accesses the dashboard, THE Admin_Panel SHALL display the count of flagged content items requiring review
6. THE Admin_Panel SHALL update statistics in real-time or with minimal delay

### Requirement 4: User Management

**User Story:** As an administrator, I want to manage user accounts and roles, so that I can maintain platform security and assign appropriate permissions.

#### Acceptance Criteria

1. WHEN an administrator views the user list, THE Admin_Panel SHALL display all registered users with their email, role, and account status
2. WHEN an administrator updates a user's role, THE Admin_Panel SHALL change the role to either teacher or admin and log the action
3. WHEN an administrator suspends a user, THE Admin_Panel SHALL prevent that user from logging in and log the suspension with reason
4. WHEN a suspended user attempts to log in, THE Auth_System SHALL reject the login and display a suspension message
5. WHEN an administrator views user details, THE Admin_Panel SHALL display the user's authentication method and last login timestamp
6. THE Admin_Panel SHALL prevent administrators from suspending their own account

### Requirement 5: Listing Management

**User Story:** As an administrator, I want to manage marketplace listings and remove inappropriate content, so that I can maintain platform quality and safety.

#### Acceptance Criteria

1. WHEN an administrator views the listing management page, THE Admin_Panel SHALL display all listings with title, seller, status, and creation date
2. WHEN an administrator deletes a listing, THE Admin_Panel SHALL remove it from the marketplace and log the deletion with reason
3. WHEN an administrator views flagged content, THE Admin_Panel SHALL display all listings that have been reported by users
4. WHEN a listing is deleted by an administrator, THE Admin_Panel SHALL notify the seller via email
5. THE Admin_Panel SHALL allow administrators to filter listings by status, seller, or date range

### Requirement 6: Activity Logging and Audit Trail

**User Story:** As a platform owner, I want all administrative actions to be logged, so that I can maintain accountability and audit system changes.

#### Acceptance Criteria

1. WHEN an administrator performs any action, THE Admin_Panel SHALL create an Activity_Log entry with action type, timestamp, and administrator ID
2. WHEN an Activity_Log entry is created, THE Admin_Panel SHALL record the IP address from which the action was performed
3. WHEN an administrator views the activity log, THE Admin_Panel SHALL display all actions in reverse chronological order
4. WHEN an administrator filters the activity log, THE Admin_Panel SHALL support filtering by action type, administrator, or date range
5. THE Activity_Log SHALL be immutable and prevent modification or deletion of entries

### Requirement 7: System Settings Management

**User Story:** As an administrator, I want to configure platform settings, so that I can customize the marketplace behavior without code changes.

#### Acceptance Criteria

1. WHEN an administrator views system settings, THE Admin_Panel SHALL display the current allowed email domain for magic link authentication
2. WHEN an administrator updates the email domain, THE Admin_Panel SHALL validate the domain format and save the change
3. WHEN an administrator views bidding settings, THE Admin_Panel SHALL display default minimum bid and bid increment values
4. WHEN an administrator updates bidding settings, THE Admin_Panel SHALL validate the values are positive numbers and save the changes
5. WHEN system settings are modified, THE Admin_Panel SHALL log the change in the Activity_Log
6. THE System_Settings SHALL apply immediately to new operations without requiring system restart

### Requirement 8: Anonymous Bidding Creation

**User Story:** As a bidder, I want to place anonymous bids on listings, so that I can negotiate prices without revealing my identity to other bidders.

#### Acceptance Criteria

1. WHEN a user places a bid on a listing with bidding enabled, THE Bidding_System SHALL create a bid record with the amount and bidder ID
2. WHEN a user places an anonymous bid, THE Bidding_System SHALL mark the bid as anonymous in the database
3. WHEN a user places a bid below the minimum bid amount, THE Bidding_System SHALL reject the bid with an error message
4. WHEN a user places a bid that does not meet the increment requirement, THE Bidding_System SHALL reject the bid with an error message
5. WHEN a user attempts to bid on their own listing, THE Bidding_System SHALL reject the bid with an error message
6. WHEN a bid is successfully placed, THE Bidding_System SHALL notify the seller via email

### Requirement 9: Bid Privacy and Anonymity

**User Story:** As a bidder, I want my identity to remain hidden from other users, so that I can bid competitively without external pressure.

#### Acceptance Criteria

1. WHEN a non-seller views bids on a listing, THE Bidding_System SHALL display anonymous bids as "Anonymous Bidder" without revealing identity
2. WHEN a seller views bids on their own listing, THE Bidding_System SHALL display the actual bidder identity for all bids
3. WHEN a user views their own bids, THE Bidding_System SHALL display their identity regardless of anonymity setting
4. THE Bidding_System SHALL never expose bidder email addresses or contact information through the API to non-sellers
5. WHEN bid data is serialized for API responses, THE Bidding_System SHALL filter bidder information based on the requesting user's relationship to the listing

### Requirement 10: Seller Bidding Controls

**User Story:** As a seller, I want to control bidding settings on my listings, so that I can set appropriate pricing parameters for my items.

#### Acceptance Criteria

1. WHEN a seller creates or updates a listing, THE Bidding_System SHALL allow enabling or disabling bidding for that listing
2. WHEN a seller enables bidding, THE Bidding_System SHALL require a minimum bid amount to be specified
3. WHEN a seller enables bidding, THE Bidding_System SHALL require a bid increment amount to be specified
4. WHEN bidding is disabled on a listing, THE Bidding_System SHALL reject any new bid attempts on that listing
5. WHEN a seller changes bidding settings, THE Bidding_System SHALL not affect existing bids on the listing
6. THE Bidding_System SHALL validate that minimum bid and bid increment are positive numbers

### Requirement 11: Bid Management and Lifecycle

**User Story:** As a seller, I want to accept or reject bids on my listings, so that I can complete transactions with preferred bidders.

#### Acceptance Criteria

1. WHEN a seller accepts a bid, THE Bidding_System SHALL mark the bid as accepted and update the listing status
2. WHEN a seller rejects a bid, THE Bidding_System SHALL mark the bid as rejected and notify the bidder
3. WHEN a bidder withdraws their bid, THE Bidding_System SHALL remove the bid if it has not been accepted
4. WHEN a bid is accepted, THE Bidding_System SHALL automatically reject all other bids on that listing
5. WHEN a seller views bids on their listing, THE Bidding_System SHALL display bids sorted by amount in descending order
6. THE Bidding_System SHALL prevent bid withdrawal after a seller has accepted the bid

### Requirement 12: Bid Validation and Business Rules

**User Story:** As a platform owner, I want bidding to follow consistent business rules, so that the marketplace operates fairly and predictably.

#### Acceptance Criteria

1. WHEN calculating the minimum acceptable bid, THE Bidding_System SHALL use the greater of the minimum bid or the highest bid plus increment
2. WHEN a listing has no existing bids, THE Bidding_System SHALL require new bids to meet or exceed the minimum bid
3. WHEN a listing has existing bids, THE Bidding_System SHALL require new bids to exceed the highest bid by at least the increment amount
4. WHEN a user retrieves their bid history, THE Bidding_System SHALL return only bids created by that user
5. WHEN retrieving bids for a listing, THE Bidding_System SHALL include bid status, amount, timestamp, and anonymized bidder information
6. THE Bidding_System SHALL prevent placing multiple identical bids from the same user on the same listing

