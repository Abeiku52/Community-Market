# Application Flow Diagram

## User Journey

### 1. Registration & Authentication Flow

```
┌─────────────┐
│   Visitor   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Register Page   │ ──► Fill form (email, password, name, school)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │ ──► Create user, send verification email
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email Inbox     │ ──► Click verification link
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Email Verified  │ ──► Account activated
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Login Page     │ ──► Enter credentials
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ JWT Token       │ ──► Stored in localStorage
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Logged In      │ ──► Access protected features
└─────────────────┘
```

### 2. Selling Flow (Create Listing)

```
┌─────────────────┐
│  Logged In User │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click "Sell"    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Create Listing Form            │
│  - Title                        │
│  - Description                  │
│  - Price                        │
│  - Category                     │
│  - Condition                    │
│  - Photos (up to 8)             │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Submit Form    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │ ──► Validate & save listing
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Upload Photos  │ ──► Store in S3
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Listing Active  │ ──► Visible to buyers
└─────────────────┘
```

### 3. Buying Flow

```
┌─────────────────┐
│   Browse Page   │ ──► View all listings
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Apply Filters   │ ──► Category, price, urgency
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Click Listing   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Listing Detail Page            │
│  - Photos                       │
│  - Description                  │
│  - Price                        │
│  - Seller info                  │
│  - Urgency indicator            │
└────────┬────────────────────────┘
         │
         ├──► Contact Seller ──► Send Message
         │
         └──► Buy Now ──┐
                        │
                        ▼
              ┌─────────────────┐
              │ Create Transaction│
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Arrange Pickup  │ ──► Via messages
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Complete Deal   │
              └────────┬────────┘
                       │
                       ▼
              ┌─────────────────┐
              │ Leave Review    │
              └─────────────────┘
```

### 4. Messaging Flow

```
┌─────────────────┐
│  Buyer          │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Contact Seller  │ ──► From listing page
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send Message    │ ──► "Is this still available?"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend API    │ ──► Save message, notify seller
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Seller         │ ──► Receives notification
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Messages Page   │ ──► View conversation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Reply           │ ──► "Yes, available!"
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Conversation    │ ──► Back and forth messages
└─────────────────┘
```

## Data Flow Architecture

### Request Flow

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Pages    │  │ Components │  │  Contexts  │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │               │               │                     │
│        └───────────────┴───────────────┘                     │
│                        │                                      │
│                ┌───────▼────────┐                            │
│                │  React Query   │ ◄── Caching & State       │
│                └───────┬────────┘                            │
│                        │                                      │
│                ┌───────▼────────┐                            │
│                │  API Service   │ ◄── Axios Client          │
│                └───────┬────────┘                            │
└────────────────────────┼──────────────────────────────────────┘
                         │
                         │ HTTP Request + JWT Token
                         │
┌────────────────────────▼──────────────────────────────────────┐
│                         Backend                               │
│                ┌───────────────┐                              │
│                │  Express App  │                              │
│                └───────┬───────┘                              │
│                        │                                       │
│                ┌───────▼────────┐                             │
│                │  Middleware    │ ◄── Auth, Error Handling   │
│                └───────┬────────┘                             │
│                        │                                       │
│                ┌───────▼────────┐                             │
│                │    Routes      │ ◄── API Endpoints          │
│                └───────┬────────┘                             │
│                        │                                       │
│                ┌───────▼────────┐                             │
│                │   Services     │ ◄── Business Logic         │
│                └───────┬────────┘                             │
│                        │                                       │
│                ┌───────▼────────┐                             │
│                │    Models      │ ◄── Data Access            │
│                └───────┬────────┘                             │
└────────────────────────┼──────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐ ┌───▼────┐ ┌───────▼────────┐
│   PostgreSQL    │ │  AWS S3│ │  Email Service │
│    Database     │ │ Photos │ │     SMTP       │
└─────────────────┘ └────────┘ └────────────────┘
```

## Feature Interactions

### Listing Lifecycle

```
┌─────────────┐
│   Created   │ ──► Seller creates listing
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Active    │ ──► Visible to buyers
└──────┬──────┘     Can receive messages
       │            Can be purchased
       │
       ├──► Edited ──► Seller updates details
       │
       ├──► Flagged ──► User reports issue
       │                Admin reviews
       │
       ├──► Sold ──┐
       │           │
       │           ▼
       │    ┌─────────────┐
       │    │ Transaction │ ──► Buyer & seller complete
       │    └──────┬──────┘
       │           │
       │           ▼
       │    ┌─────────────┐
       │    │   Reviews   │ ──► Both parties rate each other
       │    └─────────────┘
       │
       ├──► Expired ──► Auto-expire after 90 days
       │
       └──► Deleted ──► Soft delete by seller/admin
```

### Notification Triggers

```
Event                    ──►  Notification Created  ──►  User Notified
─────────────────────────────────────────────────────────────────────
New Message              ──►  "New message from X"  ──►  In-app + Email
Listing Inquiry          ──►  "X asked about Y"     ──►  In-app + Email
Review Received          ──►  "X left you a review" ──►  In-app + Email
Departure Reminder       ──►  "Leaving in 7 days"   ──►  Email
Transaction Complete     ──►  "Sale completed"      ──►  In-app
Listing Flagged          ──►  "Listing reported"    ──►  Admin only
```

## Security Flow

### Authentication

```
1. User Login
   ├─► Password hashed with bcrypt
   ├─► Compare with stored hash
   └─► Generate JWT token

2. API Request
   ├─► Extract JWT from header
   ├─► Verify token signature
   ├─► Check expiration
   └─► Attach user to request

3. Authorization
   ├─► Check user role
   ├─► Verify resource ownership
   └─► Allow/deny access
```

### Data Validation

```
Client Side (Frontend)
   ├─► HTML5 validation
   ├─► React form validation
   └─► Type checking (TypeScript)
          │
          ▼
Server Side (Backend)
   ├─► Input sanitization
   ├─► Schema validation
   ├─► Business rule checks
   └─► Database constraints
```

## Scheduled Jobs

```
Daily 2 AM
   ├─► Expire old listings (90+ days)
   ├─► Clean up unverified users (7+ days)
   └─► Send departure reminders (7 days before)

Every Hour
   ├─► Process pending notifications
   └─► Update urgency indicators

On Demand
   ├─► Email verification
   ├─► Password reset
   └─► Transaction notifications
```

## Error Handling Flow

```
Error Occurs
   │
   ▼
┌─────────────────┐
│ Try/Catch Block │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Error Handler   │ ──► Log error
└────────┬────────┘     Format response
         │              Set status code
         ▼
┌─────────────────┐
│ Client Receives │ ──► Display user-friendly message
└────────┬────────┘     Retry if appropriate
         │              Log to console (dev)
         ▼
┌─────────────────┐
│ User Notified   │
└─────────────────┘
```

## Deployment Flow

```
Development
   ├─► npm run dev (backend)
   ├─► npm run dev (frontend)
   └─► Local PostgreSQL
          │
          ▼
Testing
   ├─► npm test
   ├─► npm run build
   └─► Manual QA
          │
          ▼
Production
   ├─► Build backend (npm run build)
   ├─► Build frontend (npm run build)
   ├─► Deploy to hosting (Heroku, AWS, etc.)
   ├─► Configure production database
   ├─► Set environment variables
   └─► Monitor logs & metrics
```

This visual guide shows how all components interact to create a complete marketplace experience!
