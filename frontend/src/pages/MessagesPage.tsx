import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI } from '../services/api';
import type { Conversation } from '../types';

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messageText, setMessageText] = useState('');

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesAPI.getConversations(),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation?.listingId, selectedConversation?.otherUserId],
    queryFn: () =>
      messagesAPI.getConversation(
        selectedConversation!.listingId,
        selectedConversation!.otherUserId
      ),
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      messagesAPI.send({
        listingId: selectedConversation!.listingId,
        recipientId: selectedConversation!.otherUserId,
        content,
      }),
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({
        queryKey: ['messages', selectedConversation?.listingId, selectedConversation?.otherUserId],
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (messageText.trim()) {
      sendMessageMutation.mutate(messageText);
    }
  };

  return (
    <div className="messages-page">
      <div className="conversations-list">
        <h2>Conversations</h2>
        {conversations.length === 0 ? (
          <p>No conversations yet</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={`${conv.listingId}-${conv.otherUserId}`}
              className={`conversation-item ${
                selectedConversation?.listingId === conv.listingId &&
                selectedConversation?.otherUserId === conv.otherUserId
                  ? 'active'
                  : ''
              }`}
              onClick={() => setSelectedConversation(conv)}
            >
              <h4>{conv.listingTitle}</h4>
              <p className="other-user">{conv.otherUserName}</p>
              <p className="last-message">{conv.lastMessage}</p>
              {conv.unreadCount > 0 && (
                <span className="unread-badge">{conv.unreadCount}</span>
              )}
            </div>
          ))
        )}
      </div>

      <div className="messages-panel">
        {selectedConversation ? (
          <>
            <div className="messages-header">
              <h3>{selectedConversation.listingTitle}</h3>
              <p>with {selectedConversation.otherUserName}</p>
            </div>

            <div className="messages-list">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message ${msg.senderId === selectedConversation.otherUserId ? 'received' : 'sent'}`}
                >
                  <p>{msg.content}</p>
                  <span className="message-time">
                    {new Date(msg.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="message-input">
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type a message..."
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sendMessageMutation.isPending}
                className="btn-primary"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation">
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
