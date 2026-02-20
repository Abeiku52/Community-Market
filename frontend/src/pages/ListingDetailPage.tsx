import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listingsAPI, messagesAPI, transactionsAPI, favoritesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [interestMessage, setInterestMessage] = useState('');
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsAPI.getById(id!),
    enabled: !!id,
  });

  const { data: interestsData } = useQuery({
    queryKey: ['listing-interests', id],
    queryFn: () => listingsAPI.getInterests(id!),
    enabled: !!id && !!user,
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) =>
      messagesAPI.send({
        listingId: id!,
        recipientId: listing!.sellerId,
        content,
      }),
    onSuccess: () => {
      setMessage('');
      setShowMessageForm(false);
      alert('Message sent successfully!');
    },
  });

  const createTransactionMutation = useMutation({
    mutationFn: () =>
      transactionsAPI.create({
        listingId: id!,
        sellerId: listing!.sellerId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
      alert('Transaction created! Contact the seller to arrange pickup.');
    },
  });

  const expressInterestMutation = useMutation({
    mutationFn: (msg: string) => listingsAPI.expressInterest(id!, msg),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-interests', id] });
      setInterestMessage('');
      setShowInterestForm(false);
      alert('Interest expressed! The seller has been notified.');
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to express interest');
    },
  });

  const removeInterestMutation = useMutation({
    mutationFn: () => listingsAPI.removeInterest(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listing-interests', id] });
      alert('Interest removed successfully');
    },
  });

  // Check if favorited on load
  const { data: favoriteStatus } = useQuery({
    queryKey: ['favorite-check', id],
    queryFn: () => favoritesAPI.check(id!),
    enabled: !!id && !!user,
  });

  // Update isFavorited when data changes
  useEffect(() => {
    if (favoriteStatus !== undefined) {
      setIsFavorited(favoriteStatus);
    }
  }, [favoriteStatus]);

  const handleFavoriteToggle = async () => {
    if (!user) return;
    try {
      if (isFavorited) {
        await favoritesAPI.remove(id!);
        setIsFavorited(false);
      } else {
        await favoritesAPI.add(id!);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleShare = (method: 'copy' | 'email') => {
    const url = window.location.href;
    if (method === 'copy') {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
      setShowShareMenu(false);
    } else if (method === 'email') {
      const subject = encodeURIComponent(`Check out: ${listing?.title}`);
      const body = encodeURIComponent(`I found this item on LincolnMarket:\n\n${listing?.title}\n$${listing?.price}\n\n${url}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      setShowShareMenu(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="card card-body text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Listing not found</h3>
          <p className="text-gray-600 mb-6">The listing you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="btn-primary btn-md mx-auto">
            Back to Listings
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === listing.sellerId;
  const canContact = user && !isOwner && listing.status === 'active';
  const hasExpressedInterest = interestsData?.interests?.some(
    (interest: any) => interest.userId === user?.id
  );

  const images = listing.photos.length > 0 
    ? listing.photos 
    : [{ id: 'placeholder', photoUrl: '/placeholder.jpg', displayOrder: 0 }];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <Link to="/" className="hover:text-primary-600">Listings</Link>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-gray-900 font-medium">{listing.title}</span>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="lg:col-span-2 space-y-4">
          {/* Main Image */}
          <div className="card overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              <img
                src={images[selectedImage].photoUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800';
                }}
              />
              {listing.status !== 'active' && (
                <div className="absolute top-4 left-4">
                  <span className="badge badge-gray bg-gray-900/80 text-white backdrop-blur-sm text-sm px-3 py-1.5">
                    {listing.status.toUpperCase()}
                  </span>
                </div>
              )}
              {listing.isUrgent && listing.status === 'active' && (
                <div className="absolute top-4 right-4">
                  <span className="badge bg-red-500 text-white animate-pulse text-sm px-3 py-1.5">
                    🔥 Leaving in {listing.daysUntilDeparture} days
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {images.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary-600 ring-2 ring-primary-200'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={photo.photoUrl}
                    alt={`${listing.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=200';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Description Card */}
          <div className="card card-body">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{listing.description}</p>
          </div>

          {/* Interested Users Section */}
          {interestsData && interestsData.count > 0 && (
            <div className="card card-body">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Interested Buyers
                </h2>
                <span className="badge badge-primary">
                  {interestsData.count} {interestsData.count === 1 ? 'person' : 'people'}
                </span>
              </div>
              <div className="space-y-3">
                {interestsData.interests.map((interest: any) => (
                  <div
                    key={interest.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{interest.userName}</p>
                        {interest.message && (
                          <p className="text-sm text-gray-600 mt-1">{interest.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(interest.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Details & Actions */}
        <div className="lg:col-span-1 space-y-4">
          {/* Price & Title Card */}
          <div className="card card-body sticky top-6">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-2xl font-bold text-gray-900 flex-1">{listing.title}</h1>
              <div className="flex items-center gap-2 ml-4">
                {/* Favorite Button */}
                {user && user.id !== listing.sellerId && (
                  <button
                    onClick={handleFavoriteToggle}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
                    title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <svg 
                      className={`w-5 h-5 transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-600'}`}
                      fill={isFavorited ? 'currentColor' : 'none'}
                      stroke="currentColor" 
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
                {/* Share Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all"
                    title="Share listing"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </button>
                  {showShareMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50">
                      <button
                        onClick={() => handleShare('copy')}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleShare('email')}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-3"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Share via Email
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-bold text-primary-600">
                ${listing.price.toFixed(2)}
              </span>
            </div>

            {/* Meta Info with View Count */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="badge badge-primary capitalize">{listing.category}</span>
              <span className="badge badge-success capitalize">{listing.condition.replace('_', ' ')}</span>
              <span className="badge badge-gray">{listing.photos.length} photos</span>
              {listing.viewCount !== undefined && listing.viewCount > 0 && (
                <span className="badge badge-gray flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  {listing.viewCount} {listing.viewCount === 1 ? 'view' : 'views'}
                </span>
              )}
            </div>

            <div className="divider"></div>

            {/* Seller Info */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Seller Information</h3>
              <Link
                to={`/profile/${listing.sellerId}`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
                  {listing.sellerName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{listing.sellerName}</p>
                  <p className="text-sm text-gray-600 truncate">{listing.sellerEmail}</p>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              {listing.sellerDepartureDate && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <span className="font-medium">Leaving:</span>{' '}
                    {new Date(listing.sellerDepartureDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            {/* Safety Tip */}
            <div className="mb-6 p-4 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-sky-900 mb-1">Safety Tip</h4>
                  <p className="text-sm text-sky-800 leading-relaxed">
                    Meet in a safe, public location on campus. Inspect the item before paying. Never share personal financial information.
                  </p>
                  <Link to="/help#safety" className="text-sm font-medium text-sky-600 hover:text-sky-700 mt-2 inline-flex items-center gap-1">
                    View all safety tips
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {canContact && (
              <div className="space-y-3">
                {!hasExpressedInterest ? (
                  <button
                    onClick={() => setShowInterestForm(!showInterestForm)}
                    className="btn-primary btn-md w-full"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    I'm Interested
                  </button>
                ) : (
                  <button
                    onClick={() => removeInterestMutation.mutate()}
                    className="btn-outline btn-md w-full text-red-600 border-red-300 hover:bg-red-50"
                    disabled={removeInterestMutation.isPending}
                  >
                    {removeInterestMutation.isPending ? 'Removing...' : 'Remove Interest'}
                  </button>
                )}

                <button
                  onClick={() => setShowMessageForm(!showMessageForm)}
                  className="btn-outline btn-md w-full"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Seller
                </button>

                <button
                  onClick={() => createTransactionMutation.mutate()}
                  className="btn-success btn-md w-full"
                  disabled={createTransactionMutation.isPending}
                >
                  {createTransactionMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="spinner !w-4 !h-4 !border-2"></div>
                      Processing...
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            )}

            {isOwner && (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800 font-medium">This is your listing</p>
                </div>
                <Link
                  to={`/my-listings`}
                  className="btn-outline btn-md w-full"
                >
                  Manage Listing
                </Link>
              </div>
            )}

            {!user && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-3">Sign in to contact the seller</p>
                <Link to="/login" className="btn-primary btn-sm">
                  Sign In
                </Link>
              </div>
            )}

            {/* Interest Form */}
            {showInterestForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-slide-down">
                <h4 className="font-medium text-gray-900 mb-3">Express Your Interest</h4>
                <textarea
                  value={interestMessage}
                  onChange={(e) => setInterestMessage(e.target.value)}
                  placeholder="Optional: Add a message to the seller..."
                  rows={3}
                  className="input mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => expressInterestMutation.mutate(interestMessage)}
                    disabled={expressInterestMutation.isPending}
                    className="btn-primary btn-sm flex-1"
                  >
                    {expressInterestMutation.isPending ? 'Sending...' : 'Send'}
                  </button>
                  <button
                    onClick={() => setShowInterestForm(false)}
                    className="btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Message Form */}
            {showMessageForm && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 animate-slide-down">
                <h4 className="font-medium text-gray-900 mb-3">Send Message</h4>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  rows={4}
                  className="input mb-3"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => sendMessageMutation.mutate(message)}
                    disabled={!message || sendMessageMutation.isPending}
                    className="btn-primary btn-sm flex-1"
                  >
                    {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                  </button>
                  <button
                    onClick={() => setShowMessageForm(false)}
                    className="btn-outline btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info Card */}
          <div className="card card-body">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Listing Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Posted</span>
                <span className="text-gray-900 font-medium">
                  {new Date(listing.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status</span>
                <span className="text-gray-900 font-medium capitalize">{listing.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Category</span>
                <span className="text-gray-900 font-medium capitalize">{listing.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condition</span>
                <span className="text-gray-900 font-medium capitalize">
                  {listing.condition.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
