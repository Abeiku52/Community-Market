export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  status: TransactionStatus;
  createdAt: Date;
  completedAt: Date | null;
}

export interface CreateTransactionData {
  listingId: string;
  buyerId: string;
  sellerId: string;
}

export interface TransactionWithDetails extends Transaction {
  listingTitle: string;
  listingPrice: number;
  buyerName: string;
  buyerEmail: string;
  sellerName: string;
  sellerEmail: string;
}
