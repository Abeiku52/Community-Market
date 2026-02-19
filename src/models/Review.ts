export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export interface CreateReviewData {
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
}

export interface ReviewWithUserInfo extends Review {
  reviewerName: string;
  reviewerEmail: string;
  listingTitle: string;
}

export interface UserRating {
  userId: string;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewWithUserInfo[];
}
