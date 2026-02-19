export enum ListingCategory {
  FURNITURE = 'furniture',
  ELECTRONICS = 'electronics',
  BOOKS = 'books',
  HOUSEHOLD = 'household',
  CLOTHING = 'clothing',
  OTHER = 'other',
}

export enum ListingCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
}

export enum ListingStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  SOLD = 'sold',
  EXPIRED = 'expired',
  DELETED = 'deleted',
}

export interface Listing {
  id: string;
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  condition: ListingCondition;
  status: ListingStatus;
  buyerId: string | null;
  soldAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateListingData {
  sellerId: string;
  title: string;
  description: string;
  price: number;
  category: ListingCategory;
  condition: ListingCondition;
}

export interface UpdateListingData {
  title?: string;
  description?: string;
  price?: number;
  category?: ListingCategory;
  condition?: ListingCondition;
  status?: ListingStatus;
  buyerId?: string | null;
  soldAt?: Date | null;
}

export interface ListingPhoto {
  id: string;
  listingId: string;
  photoUrl: string;
  displayOrder: number;
  createdAt: Date;
}

export interface CreateListingPhotoData {
  listingId: string;
  photoUrl: string;
  displayOrder: number;
}

export interface ListingWithPhotos extends Listing {
  photos: ListingPhoto[];
}

export interface ListingWithDetails extends ListingWithPhotos {
  sellerName: string;
  sellerEmail: string;
  sellerDepartureDate: Date | null;
  isUrgent?: boolean;
  daysUntilDeparture?: number | null;
}
