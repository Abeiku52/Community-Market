export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  listingId: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

export interface CreateMessageData {
  senderId: string;
  recipientId: string;
  listingId: string;
  content: string;
}

export interface ConversationSummary {
  listingId: string;
  otherUserId: string;
  otherUserName: string;
  listingTitle: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export interface MessageWithUserInfo extends Message {
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
}
