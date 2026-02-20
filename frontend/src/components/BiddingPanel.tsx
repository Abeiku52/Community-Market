import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface BiddingPanelProps {
  listingId: string;
  sellerId: string;
  currentPrice: number;
  minimumBid?: number;
  bidIncrement?: number;
}

export default function BiddingPanel({ 
  listingId, 
  sellerId, 
  currentPrice,
  minimumBid,
  bidIncrement = 1 
}: BiddingPanelProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [bidAmount, setBidAmount] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [showBidForm, setShowBidForm] = useState(false);

  const isSeller = user?.id === sellerId;

  // Get bids for this listing
  const { data: bids = [] } = useQuery({
    queryKey: ['bids', listingId],
    queryFn: async () => {
      const response = await api.get(`/bids/listings/${listingId}`);
      return response.data.bids;
    },
    enabled: !!user,
  });

  // Place bid mutation
  const placeBidMutation = useMutation({
    mutationFn: async (data: { amount: number; isAnonymous: boolean; message?: string }) => {
      const response = await api.post('/bids', {
        listingId,
        ...data,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', listingId] });
      setBidAmount('');
      setMessage('');
      setShowBidForm(false);
    },
  });

  // Accept bid mutation
  const acceptBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const response = await api.post(`/bids/${bidId}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', listingId] });
    },
  });

  // Reject bid mutation
  const rejectBidMutation = useMutation({
    mutationFn: async (bidId: string) => {
      const response = await api.post(`/bids/${bidId}/reject`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bids', listingId] });
    },
  });

  const handlePlaceBid = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidAmount);
    
    if (amount < (minimumBid || currentPrice)) {
      alert(`Bid must be at least $${minimumBid || currentPrice}`);
      return;
    }

    placeBidMutation.mutate({
      amount,
      isAnonymous,
      message: message || undefined,
    });
  };

  const highestBid = bids.length > 0 ? Math.max(...bids.map((b: any) => b.amount)) : currentPrice;
  const suggestedBid = highestBid + bidIncrement;

  return (
    <div className="card card-body space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Bidding</h3>
        {bids.length > 0 && (
          <span className="badge badge-primary">{bids.length} bid{bids.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Current Highest Bid */}
      <div className="bg-primary-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-1">Current Highest Bid</p>
        <p className="text-3xl font-bold text-primary-600">${highestBid.toFixed(2)}</p>
        {minimumBid && (
          <p className="text-xs text-gray-500 mt-1">Minimum bid: ${minimumBid.toFixed(2)}</p>
        )}
      </div>

      {/* Place Bid Form */}
      {!isSeller && user && (
        <div>
          {!showBidForm ? (
            <button
              onClick={() => setShowBidForm(true)}
              className="btn-primary btn-md w-full"
            >
              Place a Bid
            </button>
          ) : (
            <form onSubmit={handlePlaceBid} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Bid Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500">$</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    className="input pl-7"
                    placeholder={suggestedBid.toFixed(2)}
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Suggested: ${suggestedBid.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="input"
                  rows={2}
                  placeholder="Add a message to the seller..."
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="anonymous"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="anonymous" className="text-sm text-gray-700">
                  Place bid anonymously
                  <span className="block text-xs text-gray-500">
                    Only the seller will see your identity
                  </span>
                </label>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowBidForm(false)}
                  className="btn-outline btn-md flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={placeBidMutation.isPending}
                  className="btn-primary btn-md flex-1"
                >
                  {placeBidMutation.isPending ? 'Placing...' : 'Place Bid'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Bids List */}
      {bids.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">
            {isSeller ? 'All Bids' : 'Recent Bids'}
          </h4>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {bids.map((bid: any) => (
              <div
                key={bid.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">
                      ${bid.amount.toFixed(2)}
                    </span>
                    {bid.isAnonymous && !isSeller && (
                      <span className="badge badge-gray text-xs">Anonymous</span>
                    )}
                    {bid.status === 'accepted' && (
                      <span className="badge badge-success text-xs">Accepted</span>
                    )}
                    {bid.status === 'rejected' && (
                      <span className="badge badge-danger text-xs">Rejected</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    by {bid.bidderName}
                  </p>
                  {bid.message && (
                    <p className="text-xs text-gray-500 mt-1 italic">"{bid.message}"</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(bid.createdAt).toLocaleString()}
                  </p>
                </div>

                {/* Seller Actions */}
                {isSeller && bid.status === 'active' && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => acceptBidMutation.mutate(bid.id)}
                      disabled={acceptBidMutation.isPending}
                      className="btn-primary btn-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => rejectBidMutation.mutate(bid.id)}
                      disabled={rejectBidMutation.isPending}
                      className="btn-outline btn-sm"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {bids.length === 0 && (
        <div className="text-center py-8">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">No bids yet</p>
          <p className="text-xs text-gray-500">Be the first to place a bid!</p>
        </div>
      )}
    </div>
  );
}
