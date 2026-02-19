# Teacher Marketplace Frontend

React frontend for the Teacher Marketplace platform built with Vite, TypeScript, and React Query.

## Features

- User authentication (login/register)
- Browse and search listings with filters
- Create and manage listings with photo uploads
- Real-time messaging between buyers and sellers
- User profiles with reviews and ratings
- Transaction management
- Responsive design

## Tech Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack React Query
- Axios

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on http://localhost:3000

### Installation

```bash
cd frontend
npm install
```

### Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:3000/api
```

### Development

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable components
│   ├── Layout.tsx
│   └── ListingCard.tsx
├── contexts/        # React contexts
│   └── AuthContext.tsx
├── pages/           # Page components
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ListingDetailPage.tsx
│   ├── CreateListingPage.tsx
│   ├── MyListingsPage.tsx
│   ├── MessagesPage.tsx
│   └── ProfilePage.tsx
├── services/        # API services
│   └── api.ts
├── types/           # TypeScript types
│   └── index.ts
├── config/          # Configuration
│   └── api.ts
├── App.tsx          # Main app component
└── main.tsx         # Entry point
```

## Available Routes

- `/` - Browse listings
- `/login` - Login page
- `/register` - Registration page
- `/listings/:id` - Listing details
- `/create-listing` - Create new listing (protected)
- `/my-listings` - User's listings (protected)
- `/messages` - Messages/conversations (protected)
- `/profile/:id` - User profile

## API Integration

The frontend communicates with the backend API through axios with automatic JWT token handling. All API calls are managed through React Query for caching and state management.

## Authentication

JWT tokens are stored in localStorage and automatically included in API requests. The AuthContext provides authentication state throughout the app.
