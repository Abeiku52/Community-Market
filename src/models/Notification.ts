export enum NotificationType {
  NEW_MESSAGE = 'new_message',
  LISTING_INQUIRY = 'listing_inquiry',
  REVIEW_RECEIVED = 'review_received',
  DEPARTURE_REMINDER = 'departure_reminder',
  NEW_LISTING = 'new_listing',
  LISTING_INTEREST = 'listing_interest',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  data: Record<string, any>;
}

export interface NotificationPreference {
  userId: string;
  emailNewMessage: boolean;
  emailListingInquiry: boolean;
  emailReviewReceived: boolean;
  emailDepartureReminder: boolean;
  inAppNewMessage: boolean;
  inAppListingInquiry: boolean;
  inAppReviewReceived: boolean;
  inAppDepartureReminder: boolean;
}

export interface UpdateNotificationPreferenceData {
  emailNewMessage?: boolean;
  emailListingInquiry?: boolean;
  emailReviewReceived?: boolean;
  emailDepartureReminder?: boolean;
  inAppNewMessage?: boolean;
  inAppListingInquiry?: boolean;
  inAppReviewReceived?: boolean;
  inAppDepartureReminder?: boolean;
}
