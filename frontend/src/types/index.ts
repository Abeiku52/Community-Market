export interface User {
  id: string;
  email: string;
  name: string;
  schoolAffiliation: string;
  departureDate: string | null;
  role: 'staff' | 'admin';
  emailVerified: boolean;
  createdAt: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: 'furniture' | 'electronics' | 'books' | 'household' | 'clothing' | 'other';
  condition: 'new' | 'like_new' | 'good' | 'fair';
  status: 'active' | 'pending' | 'sold' | 'expired' | 'deleted';
  photos: ListingPhoto[];
  viewCount?: number;
  favoriteCount?: number;
  shareCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ListingPhoto {
  id: string;
  listingId: string;
  photoUrl: string;
  displayOrder: number;
  createdAt: string;
}

export interface ListingWithDetails extends Listing {
  sellerName: string;
  sellerEmail: string;
  sellerDepartureDate: string | null;
  isUrgent?: boolean;
  daysUntilDeparture?: number | null;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  listingId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  listingId: string;
  otherUserId: string;
  otherUserName: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt: string | null;
}

export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'new_message' | 'listing_inquiry' | 'review_received' | 'departure_reminder';
  data: Record<string, any>;
  isRead: boolean;
  createdAt: string;
}
