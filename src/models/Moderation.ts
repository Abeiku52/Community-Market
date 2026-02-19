export enum FlagStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
}

export enum ModerationAction {
  HIDE = 'hide',
  DELETE = 'delete',
  RESTORE = 'restore',
}

export interface Flag {
  id: string;
  listingId: string;
  reporterId: string;
  reason: string;
  status: FlagStatus;
  reviewedBy: string | null;
  reviewedAt: Date | null;
  action: ModerationAction | null;
  createdAt: Date;
}

export interface CreateFlagData {
  listingId: string;
  reporterId: string;
  reason: string;
}

export interface FlagWithDetails extends Flag {
  listingTitle: string;
  listingStatus: string;
  reporterName: string;
  reporterEmail: string;
  reviewerName: string | null;
}

export interface UserSuspension {
  id: string;
  userId: string;
  adminId: string;
  reason: string;
  suspendedAt: Date;
  expiresAt: Date;
}

export interface CreateUserSuspensionData {
  userId: string;
  adminId: string;
  reason: string;
  durationDays: number;
}

export interface UserSuspensionWithDetails extends UserSuspension {
  userName: string;
  userEmail: string;
  adminName: string;
  isActive: boolean;
}
