import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { favoritesAPI } from '../services/api';
import type { Listing, ListingWithDetails } from '../types';

interface ListingCardProps {
  listing: Listing | ListingWithDetails;
  isFavorited?: boolean;
  onFavoriteChange?: () => void;
}

const categoryIcons: Record<string, string> = {
  furniture: '🪑',
  electronics: '💻',
  books: '📚',
  household: '🏠',
  clothing: '👕',
  other: '📦',
};

const conditionColors: Record<string, string> = {
  new: 'badge-success',
  like_new: 'badge-primary',
  good: 'badge-gray',
  fair: 'badge-warning',
};

export default function ListingCard({ listing, isFavorited: initialFavorited = false, onFavoriteChange }: ListingCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const photoUrl = listing.photos[0]?.photoUrl || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
  
  // Type guard to check if listing has isUrgent property
  const isListingWithDetails = (l: Listing | ListingWithDetails): l is ListingWithDetails => {
    return 'isUrgent' in l;
  };
  
  const isUrgent = isListingWithDetails(listing) && listing.isUrgent && listing.status === 'active' && listing.daysUntilDeparture;

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user || isTogglingFavorite) return;

    setIsTogglingFavorite(true);
    try {
      if (isFavorited) {
        await favoritesAPI.remove(listing.id);
        setIsFavorited(false);
      } else {
        await favoritesAPI.add(listing.id);
        setIsFavorited(true);
      }
      onFavoriteChange?.();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsTogglingFavorite(false);
    }
  };

  return (
    <Link 
      to={`/listings/${listing.id}`} 
      className="group card overflow-hidden transition-all duration-200 hover:shadow-lg"
      style={{ textDecoration: 'none' }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <img
          src={photoUrl}
          alt={listing.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=400';
          }}
        />
        
        {/* Favorite Button */}
        {user && (
          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm shadow-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:bg-white z-10"
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg 
              className={`w-5 h-5 transition-colors ${isFavorited ? 'text-red-500 fill-red-500' : 'text-slate-400 hover:text-red-500'}`}
              fill={isFavorited ? 'currentColor' : 'none'}
              stroke="currentColor" 
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}
        
        {/* Status Badge */}
        {listing.status !== 'active' && (
          <div className="absolute top-3 left-3">
            <span className="badge badge-gray bg-slate-900/80 text-white backdrop-blur-sm text-xs font-medium">
              {listing.status.toUpperCase()}
            </span>
          </div>
        )}
        
        {/* Urgent Badge */}
        {isUrgent && (
          <div className="absolute top-3 left-3" style={{ marginTop: listing.status !== 'active' ? '2.5rem' : '0' }}>
            <span className="badge bg-red-500 text-white animate-pulse text-xs font-medium shadow-lg">
              🔥 Urgent
            </span>
          </div>
        )}

        {/* Category Icon */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/95 backdrop-blur-sm text-lg shadow-md">
            {categoryIcons[listing.category] || '📦'}
          </span>
        </div>

        {/* Photo Count */}
        {listing.photos.length > 1 && (
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-900/80 text-white backdrop-blur-sm text-xs font-medium">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {listing.photos.length}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="card-body space-y-3">
        {/* Title */}
        <h3 className="text-base font-semibold text-slate-900 line-clamp-2 min-h-[3rem] leading-snug group-hover:text-sky-600 transition-colors">
          {listing.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-slate-600 line-clamp-2 min-h-[2.5rem] leading-relaxed">
          {listing.description}
        </p>

        {/* Meta Info */}
        <div className="flex items-center flex-wrap gap-2 pt-2">
          <span className={`badge ${conditionColors[listing.condition]} text-xs font-medium`}>
            {listing.condition.replace('_', ' ')}
          </span>
          <span className="badge badge-gray text-xs font-medium capitalize">
            {listing.category}
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="text-2xl font-bold text-sky-600">
            ${listing.price.toFixed(2)}
          </div>
          
          {/* View Button */}
          <div className="flex items-center gap-1.5 text-sm font-semibold text-sky-600 opacity-0 group-hover:opacity-100 transition-all duration-200">
            <span>View</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
