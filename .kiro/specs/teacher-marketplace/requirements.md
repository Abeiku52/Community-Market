# Requirements Document

## Introduction

The Teacher Marketplace is a platform designed for international school communities where teachers can sell their belongings before departing the country. The system enables teachers to list items for sale, browse available items, communicate with potential buyers, and complete transactions within a trusted school community environment.

## Glossary

- **Seller**: A teacher who lists items for sale on the marketplace
- **Buyer**: A teacher or staff member who browses and purchases items
- **Listing**: An item posted for sale with description, price, and photos
- **Transaction**: The complete process of purchasing an item from listing to completion
- **Marketplace**: The platform system that manages listings, users, and transactions
- **School_Admin**: A user with administrative privileges to moderate content and manage users

## Requirements

### Requirement 1: User Registration and Authentication

**User Story:** As a teacher, I want to create an account and log in securely, so that I can access the marketplace and manage my listings.

#### Acceptance Criteria

1. WHEN a user provides valid school email and password, THE Marketplace SHALL create a new account
2. WHEN a user attempts to register with an invalid school email domain, THE Marketplace SHALL reject the registration
3. WHEN a registered user provides correct credentials, THE Marketplace SHALL authenticate and grant access
4. WHEN a user provides incorrect credentials, THE Marketplace SHALL deny access and display an error message
5. THE Marketplace SHALL require email verification before allowing full account access

### Requirement 2: Item Listing Creation

**User Story:** As a seller, I want to create listings for items I want to sell, so that other teachers can discover and purchase them.

#### Acceptance Criteria

1. WHEN a seller provides item details (title, description, price, category), THE Marketplace SHALL create a new listing
2. WHEN a seller uploads photos for a listing, THE Marketplace SHALL store and display them with the listing
3. WHEN a seller attempts to create a listing without required fields, THE Marketplace SHALL prevent creation and indicate missing fields
4. THE Marketplace SHALL allow sellers to specify item condition (new, like new, good, fair)
5. THE Marketplace SHALL allow sellers to categorize items (furniture, electronics, books, household, clothing, other)
6. WHEN a listing is created, THE Marketplace SHALL set its status to active and make it visible to buyers

### Requirement 3: Item Browsing and Search

**User Story:** As a buyer, I want to browse and search for items, so that I can find things I need to purchase.

#### Acceptance Criteria

1. WHEN a buyer accesses the marketplace, THE Marketplace SHALL display all active listings
2. WHEN a buyer enters a search query, THE Marketplace SHALL return listings matching the title or description
3. WHEN a buyer selects a category filter, THE Marketplace SHALL display only listings in that category
4. WHEN a buyer selects a price range filter, THE Marketplace SHALL display only listings within that range
5. WHEN a buyer clicks on a listing, THE Marketplace SHALL display full item details including all photos and seller information

### Requirement 4: Seller Listing Management

**User Story:** As a seller, I want to manage my listings, so that I can update information or remove items that are no longer available.

#### Acceptance Criteria

1. WHEN a seller views their profile, THE Marketplace SHALL display all their listings
2. WHEN a seller edits a listing, THE Marketplace SHALL update the listing information
3. WHEN a seller marks a listing as sold, THE Marketplace SHALL change its status and remove it from active listings
4. WHEN a seller deletes a listing, THE Marketplace SHALL remove it from the marketplace
5. THE Marketplace SHALL allow sellers to mark listings as pending when a sale is in progress

### Requirement 5: Buyer-Seller Communication

**User Story:** As a buyer, I want to contact sellers about their items, so that I can ask questions and arrange purchases.

#### Acceptance Criteria

1. WHEN a buyer sends a message to a seller about a listing, THE Marketplace SHALL deliver the message to the seller
2. WHEN a seller receives a message, THE Marketplace SHALL notify them via email and in-app notification
3. WHEN a seller replies to a message, THE Marketplace SHALL deliver the reply to the buyer
4. THE Marketplace SHALL maintain a conversation thread for each listing inquiry
5. THE Marketplace SHALL display unread message counts to users

### Requirement 6: Transaction Management

**User Story:** As a buyer and seller, I want to track the status of transactions, so that both parties know the current state of the sale.

#### Acceptance Criteria

1. WHEN a buyer and seller agree on a purchase, THE Marketplace SHALL allow marking the transaction as pending
2. WHEN a transaction is completed, THE Marketplace SHALL allow the seller to mark the listing as sold
3. WHEN a listing is marked as sold, THE Marketplace SHALL record the sale date and buyer information
4. THE Marketplace SHALL maintain a transaction history for both buyers and sellers
5. WHEN a transaction is cancelled, THE Marketplace SHALL restore the listing to active status

### Requirement 7: User Profiles

**User Story:** As a user, I want to maintain a profile with my information, so that other users can identify and trust me within the school community.

#### Acceptance Criteria

1. THE Marketplace SHALL display user profiles showing name, school affiliation, and join date
2. WHEN a user updates their profile information, THE Marketplace SHALL save and display the changes
3. THE Marketplace SHALL display a user's active listings on their profile
4. THE Marketplace SHALL display a user's rating and review count on their profile
5. WHEN a user views another user's profile, THE Marketplace SHALL show their public information and listings

### Requirement 8: Rating and Review System

**User Story:** As a buyer, I want to rate and review sellers after a transaction, so that the community can make informed decisions.

#### Acceptance Criteria

1. WHEN a transaction is completed, THE Marketplace SHALL allow the buyer to rate the seller (1-5 stars)
2. WHEN a buyer submits a rating, THE Marketplace SHALL allow them to add a written review
3. WHEN a review is submitted, THE Marketplace SHALL display it on the seller's profile
4. THE Marketplace SHALL calculate and display average ratings for each seller
5. WHEN a seller receives a review, THE Marketplace SHALL notify them

### Requirement 9: Content Moderation

**User Story:** As a school admin, I want to moderate content and manage users, so that the marketplace remains safe and appropriate for the school community.

#### Acceptance Criteria

1. WHEN an admin flags a listing as inappropriate, THE Marketplace SHALL hide it from public view
2. WHEN an admin reviews a flagged listing, THE Marketplace SHALL allow them to delete it or restore it
3. THE Marketplace SHALL allow admins to suspend user accounts for policy violations
4. THE Marketplace SHALL allow admins to view all listings and user activity
5. WHEN a user reports a listing, THE Marketplace SHALL notify admins for review

### Requirement 10: Departure Date Tracking

**User Story:** As a seller, I want to indicate my departure date, so that buyers know the urgency of purchasing my items.

#### Acceptance Criteria

1. THE Marketplace SHALL allow sellers to set a departure date on their profile
2. WHEN a departure date is set, THE Marketplace SHALL display it on the seller's listings
3. WHEN a seller's departure date is within 30 days, THE Marketplace SHALL display an urgency indicator on their listings
4. THE Marketplace SHALL allow filtering listings by sellers leaving soon
5. WHEN a seller's departure date passes, THE Marketplace SHALL automatically mark their listings as expired

### Requirement 11: Photo Management

**User Story:** As a seller, I want to upload multiple photos for my listings, so that buyers can see the condition and details of items.

#### Acceptance Criteria

1. THE Marketplace SHALL allow sellers to upload up to 8 photos per listing
2. WHEN a seller uploads a photo, THE Marketplace SHALL validate the file type (JPEG, PNG) and size (max 5MB)
3. WHEN invalid photos are uploaded, THE Marketplace SHALL reject them and display an error message
4. THE Marketplace SHALL allow sellers to reorder photos with the first photo as the primary image
5. THE Marketplace SHALL allow sellers to delete photos from existing listings

### Requirement 12: Notification System

**User Story:** As a user, I want to receive notifications about important events, so that I stay informed about my marketplace activity.

#### Acceptance Criteria

1. WHEN a seller receives a message about a listing, THE Marketplace SHALL send an email notification
2. WHEN a listing receives a new inquiry, THE Marketplace SHALL send an in-app notification to the seller
3. WHEN a buyer's inquiry receives a reply, THE Marketplace SHALL notify the buyer
4. THE Marketplace SHALL allow users to configure notification preferences (email, in-app, both, none)
5. WHEN a seller's departure date is within 7 days, THE Marketplace SHALL send a reminder notification
