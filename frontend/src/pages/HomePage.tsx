import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listingsAPI } from '../services/api';
import ListingCard from '../components/ListingCard';
import { Link } from 'react-router-dom';
import type { Listing } from '../types';

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular';

export default function HomePage() {
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    search: '',
    leavingSoon: false,
  });
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => listingsAPI.search({
      category: filters.category || undefined,
      minPrice: filters.minPrice ? Number(filters.minPrice) : undefined,
      maxPrice: filters.maxPrice ? Number(filters.maxPrice) : undefined,
      search: filters.search || undefined,
      leavingSoon: filters.leavingSoon || undefined,
    }),
  });

  // Sort listings based on selected option
  const sortedListings = useMemo(() => {
    const sorted = [...listings];
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'popular':
        return sorted.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
      default:
        return sorted;
    }
  }, [listings, sortBy]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-20 shadow-xl border border-slate-800">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-sm font-medium text-white/90">Trusted Community Marketplace</span>
          </div>
          <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl mb-6" style={{ letterSpacing: '-0.02em' }}>
            Your Community Marketplace,
            <br />
            <span className="gradient-text" style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Simplified</span>
          </h1>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Buy and sell quality items within your community. Safe, trusted, and convenient for all members.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/create-listing" className="btn-primary btn-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Start Selling
            </Link>
            <button 
              onClick={() => document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary btn-lg"
            >
              Browse Listings
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="card card-body text-center hover-lift">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-sky-50 to-sky-100 mb-4 mx-auto shadow-sm">
            <svg className="w-7 h-7 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">{listings.length}+</div>
          <div className="text-sm text-slate-600 font-medium">Active Listings</div>
        </div>
        <div className="card card-body text-center hover-lift">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 mb-4 mx-auto shadow-sm">
            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">500+</div>
          <div className="text-sm text-slate-600 font-medium">Happy Members</div>
        </div>
        <div className="card card-body text-center hover-lift">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 mb-4 mx-auto shadow-sm">
            <svg className="w-7 h-7 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-2">50+</div>
          <div className="text-sm text-slate-600 font-medium">School Sections</div>
        </div>
      </div>

      {/* Filters Section */}
      <div id="listings" className="card card-body shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Browse Listings</h2>
            <p className="text-sm text-slate-600">Find what you need from our community</p>
          </div>
          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="input py-2 px-3 text-sm"
              style={{ minWidth: '150px' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search by title or description..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="input w-full pl-11"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input w-full"
            >
              <option value="">All Categories</option>
              <option value="furniture">🪑 Furniture</option>
              <option value="electronics">💻 Electronics</option>
              <option value="books">📚 Books</option>
              <option value="household">🏠 Household</option>
              <option value="clothing">👕 Clothing</option>
              <option value="other">📦 Other</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Price Range</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <span className="text-slate-500 font-medium">$</span>
                </div>
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="input w-full"
                  style={{ paddingLeft: '2rem' }}
                  min="0"
                />
              </div>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <span className="text-slate-500 font-medium">$</span>
                </div>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="input w-full"
                  style={{ paddingLeft: '2rem' }}
                  min="0"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Leaving Soon Filter */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={filters.leavingSoon}
                onChange={(e) => setFilters({ ...filters, leavingSoon: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-sky-600 transition-colors"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Show only leaving soon</span>
              <span className="badge badge-warning text-xs">🔥 Urgent</span>
            </div>
          </label>
          <button
            onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', leavingSoon: false })}
            className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="spinner"></div>
        </div>
      ) : sortedListings.length === 0 ? (
        <div className="card card-body text-center py-20">
          <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No listings found</h3>
          <p className="text-gray-600 mb-6">Try adjusting your filters or be the first to create a listing!</p>
          <Link to="/create-listing" className="btn-primary btn-md mx-auto">
            Create First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {sortedListings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
