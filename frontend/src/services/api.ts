import api from '../config/api';
import type { Listing, ListingWithDetails, Message, Conversation, Transaction, Notification } from '../types';

// Auth API
export const authAPI = {
  register: async (data: { email: string; password: string; name: string; schoolAffiliation: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
};

// Listings API
export const listingsAPI = {
  search: async (params?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    leavingSoon?: boolean;
  }) => {
    const response = await api.get<{ listings: Listing[] }>('/listings', { params });
    return response.data.listings;
  },

  getById: async (id: string) => {
    const response = await api.get<{ listing: ListingWithDetails }>(`/listings/${id}`);
    return response.data.listing;
  },

  create: async (data: {
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
  }) => {
    const response = await api.post('/listings', data);
    return response.data.listing;
  },

  update: async (id: string, data: Partial<Listing>) => {
    const response = await api.put(`/listings/${id}`, data);
    return response.data.listing;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/listings/${id}`);
    return response.data;
  },

  markAsSold: async (id: string, buyerId: string) => {
    const response = await api.post(`/listings/${id}/mark-sold`, { buyerId });
    return response.data;
  },

  uploadPhoto: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/listings/${id}/photos`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.photo;
  },

  deletePhoto: async (listingId: string, photoId: string) => {
    const response = await api.delete(`/listings/${listingId}/photos/${photoId}`);
    return response.data;
  },

  // Interest methods
  expressInterest: async (id: string, message?: string) => {
    const response = await api.post(`/listings/${id}/interest`, { message });
    return response.data;
  },

  getInterests: async (id: string) => {
    const response = await api.get<{ interests: any[]; count: number }>(`/listings/${id}/interests`);
    return response.data;
  },

  removeInterest: async (id: string) => {
    const response = await api.delete(`/listings/${id}/interest`);
    return response.data;
  },
};

// Messages API
export const messagesAPI = {
  send: async (data: { listingId: string; recipientId: string; content: string }) => {
    const response = await api.post('/messages', data);
    return response.data.message;
  },

  getConversations: async () => {
    const response = await api.get<{ conversations: Conversation[] }>('/messages/conversations');
    return response.data.conversations;
  },

  getConversation: async (listingId: string, otherUserId: string) => {
    const response = await api.get<{ messages: Message[] }>(`/messages/conversations/${listingId}/${otherUserId}`);
    return response.data.messages;
  },

  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>('/messages/unread-count');
    return response.data.count;
  },
};

// Transactions API
export const transactionsAPI = {
  create: async (data: { listingId: string; sellerId: string }) => {
    const response = await api.post('/transactions', data);
    return response.data.transaction;
  },

  complete: async (id: string) => {
    const response = await api.put(`/transactions/${id}/complete`);
    return response.data.transaction;
  },

  cancel: async (id: string) => {
    const response = await api.put(`/transactions/${id}/cancel`);
    return response.data.transaction;
  },

  getHistory: async () => {
    const response = await api.get<{ transactions: Transaction[] }>('/transactions/history/all');
    return response.data.transactions;
  },
};

// Reviews API
export const reviewsAPI = {
  create: async (data: { transactionId: string; revieweeId: string; rating: number; comment?: string }) => {
    const response = await api.post('/reviews', data);
    return response.data.review;
  },

  getUserReviews: async (userId: string) => {
    const response = await api.get(`/reviews/users/${userId}`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getProfile: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/users/profile/me');
    return response.data.user;
  },

  updateProfile: async (data: { name?: string; schoolAffiliation?: string; departureDate?: string | null }) => {
    const response = await api.put('/users/profile', data);
    return response.data.user;
  },

  getUserListings: async (id: string) => {
    const response = await api.get<{ listings: Listing[] }>(`/users/${id}/listings`);
    return response.data.listings;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (unreadOnly = false) => {
    const response = await api.get<{ notifications: Notification[] }>('/notifications', {
      params: { unreadOnly },
    });
    return response.data.notifications;
  },

  getUnreadCount: async () => {
    const response = await api.get<{ count: number }>('/notifications/unread-count');
    return response.data.count;
  },

  markAsRead: async (id: string) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/mark-all-read');
    return response.data;
  },

  getPreferences: async () => {
    const response = await api.get('/notifications/preferences');
    return response.data.preferences;
  },

  updatePreferences: async (preferences: Record<string, boolean>) => {
    const response = await api.put('/notifications/preferences', preferences);
    return response.data.preferences;
  },
};

// Moderation API
export const moderationAPI = {
  flagListing: async (data: { listingId: string; reason: string }) => {
    const response = await api.post('/moderation/flag', data);
    return response.data;
  },

  getFlaggedListings: async () => {
    const response = await api.get('/moderation/flagged');
    return response.data.flaggedListings;
  },

  reviewFlag: async (data: { flagId: string; action: 'hide' | 'delete' | 'restore' }) => {
    const response = await api.post('/moderation/review', data);
    return response.data;
  },

  suspendUser: async (data: { userId: string; reason: string; durationDays: number }) => {
    const response = await api.post('/moderation/suspend-user', data);
    return response.data;
  },
};

// Favorites API
export const favoritesAPI = {
  add: async (listingId: string) => {
    const response = await api.post('/favorites', { listingId });
    return response.data;
  },

  remove: async (listingId: string) => {
    const response = await api.delete(`/favorites/${listingId}`);
    return response.data;
  },

  getAll: async () => {
    const response = await api.get('/favorites');
    return response.data;
  },

  check: async (listingId: string) => {
    const response = await api.get<{ isFavorited: boolean }>(`/favorites/check/${listingId}`);
    return response.data.isFavorited;
  },
};

// Offers API
export const offersAPI = {
  create: async (data: { listingId: string; offerAmount: number; message?: string }) => {
    const response = await api.post('/offers', data);
    return response.data;
  },

  getListingOffers: async (listingId: string) => {
    const response = await api.get(`/offers/listing/${listingId}`);
    return response.data;
  },

  getMyOffers: async () => {
    const response = await api.get('/offers/my-offers');
    return response.data;
  },

  getReceivedOffers: async () => {
    const response = await api.get('/offers/received');
    return response.data;
  },

  accept: async (offerId: string) => {
    const response = await api.post(`/offers/${offerId}/accept`);
    return response.data;
  },

  reject: async (offerId: string) => {
    const response = await api.post(`/offers/${offerId}/reject`);
    return response.data;
  },

  counter: async (offerId: string, counterAmount: number, counterMessage?: string) => {
    const response = await api.post(`/offers/${offerId}/counter`, { counterAmount, counterMessage });
    return response.data;
  },

  withdraw: async (offerId: string) => {
    const response = await api.delete(`/offers/${offerId}`);
    return response.data;
  },
};
