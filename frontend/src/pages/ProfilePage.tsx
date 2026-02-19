import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI, reviewsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import ListingCard from '../components/ListingCard';

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isOwnProfile = user?.id === id;

  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    schoolAffiliation: '',
    departureDate: '',
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => usersAPI.getProfile(id!),
    enabled: !!id,
  });

  const { data: listings = [] } = useQuery({
    queryKey: ['userListings', id],
    queryFn: () => usersAPI.getUserListings(id!),
    enabled: !!id,
  });

  const { data: reviewData } = useQuery({
    queryKey: ['userReviews', id],
    queryFn: () => reviewsAPI.getUserReviews(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (profile && isOwnProfile) {
      setProfileData({
        name: profile.user.name,
        schoolAffiliation: profile.user.schoolAffiliation,
        departureDate: profile.user.departureDate || '',
      });
    }
  }, [profile, isOwnProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: () => usersAPI.updateProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', id] });
      setEditMode(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="card card-body text-center py-16">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile not found</h3>
          <p className="text-gray-600 mb-6">The user profile you're looking for doesn't exist.</p>
          <Link to="/" className="btn-primary btn-md mx-auto">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status === 'active');
  const soldListings = listings.filter(l => l.status === 'sold');

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-6">
      {/* Profile Header */}
      <div className="card card-body">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {profile.user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{profile.user.name}</h1>
                <p className="text-gray-600 mt-1">{profile.user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="badge badge-primary">{profile.user.schoolAffiliation}</span>
                  {profile.user.departureDate && (
                    <span className="badge badge-warning">
                      Leaving {new Date(profile.user.departureDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {isOwnProfile && (
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="btn-outline btn-sm"
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </button>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center p-4 bg-gradient-to-br from-sky-50 to-sky-100 rounded-xl border border-sky-200">
                <p className="text-2xl font-bold text-slate-900 mb-1">{listings.length}</p>
                <p className="text-xs font-medium text-slate-600">Total Listings</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                <p className="text-2xl font-bold text-slate-900 mb-1">{activeListings.length}</p>
                <p className="text-xs font-medium text-slate-600">Active</p>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl border border-violet-200">
                <p className="text-2xl font-bold text-slate-900 mb-1">
                  {reviewData?.averageRating?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-xs font-medium text-slate-600">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {editMode && (
        <div className="card card-body animate-slide-down">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="input"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="form-label">Organization / Community</label>
              <input
                type="text"
                value={profileData.schoolAffiliation}
                onChange={(e) => setProfileData({ ...profileData, schoolAffiliation: e.target.value })}
                className="input"
                placeholder="e.g., Tech Company, Neighborhood, Club"
              />
              <span className="form-hint">Your section, department, or organization</span>
            </div>

            <div>
              <label className="form-label">Departure Date (Optional)</label>
              <input
                type="date"
                value={profileData.departureDate}
                onChange={(e) => setProfileData({ ...profileData, departureDate: e.target.value })}
                className="input"
              />
              <span className="form-hint">Let buyers know if you're leaving soon</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => updateProfileMutation.mutate()}
                disabled={updateProfileMutation.isPending}
                className="btn-primary btn-md"
              >
                {updateProfileMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="spinner !w-4 !h-4 !border-2"></div>
                    Saving...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </button>
              <button
                onClick={() => setEditMode(false)}
                className="btn-outline btn-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listings Section */}
      <div className="card card-body">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isOwnProfile ? 'Your Listings' : `${profile.user.name}'s Listings`}
          </h2>
          <span className="badge badge-gray">{listings.length} total</span>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-600">No listings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      {reviewData && reviewData.reviews && reviewData.reviews.length > 0 && (
        <div className="card card-body">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-gray-900">{reviewData.averageRating?.toFixed(1)}</span>
              <div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(reviewData.averageRating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-xs text-gray-600">{reviewData.totalReviews} reviews</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {reviewData.reviews.map((review: any) => (
              <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-gray-700">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
