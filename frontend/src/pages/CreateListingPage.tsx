import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { listingsAPI } from '../services/api';

export default function CreateListingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'furniture',
    condition: 'good',
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdListing, setCreatedListing] = useState<any>(null);

  const createListingMutation = useMutation({
    mutationFn: async () => {
      setUploadProgress(10);
      const listing = await listingsAPI.create({
        ...formData,
        price: Number(formData.price),
      });

      setUploadProgress(50);
      
      // Upload photos
      for (let i = 0; i < photos.length; i++) {
        await listingsAPI.uploadPhoto(listing.id, photos[i]);
        setUploadProgress(50 + ((i + 1) / photos.length) * 50);
      }

      return listing;
    },
    onSuccess: (listing) => {
      setCreatedListing(listing);
      setShowSuccess(true);
      setUploadProgress(100);
    },
    onError: (err: any) => {
      setError(err.response?.data?.error || 'Failed to create listing');
      setUploadProgress(0);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    createListingMutation.mutate();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      if (files.length + photos.length > 8) {
        setError('Maximum 8 photos allowed');
        return;
      }
      
      setPhotos([...photos, ...files]);
      
      // Create previews
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
  };

  // Success Modal
  if (showSuccess && createdListing) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }} className="animate-fade-in">
          {/* Success Icon */}
          <div style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            animation: 'bounce-in 0.6s ease-out'
          }}>
            <svg style={{ width: '40px', height: '40px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Success Message */}
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.75rem' }}>
            🎉 Listing Created Successfully!
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Your listing "<strong>{createdListing.title}</strong>" is now live and visible to the community.
          </p>

          {/* Stats Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '0.75rem', 
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ 
              padding: '1rem', 
              background: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>💰</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                ${Number(formData.price).toFixed(2)}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Price</div>
            </div>
            <div style={{ 
              padding: '1rem', 
              background: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>📸</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb' }}>
                {photos.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Photos</div>
            </div>
            <div style={{ 
              padding: '1rem', 
              background: 'white', 
              borderRadius: '8px', 
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>✨</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb', textTransform: 'capitalize' }}>
                {formData.condition.replace('_', ' ')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>Condition</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link
              to={`/listings/${createdListing.id}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                color: 'white',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '1rem',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
              }}
            >
              <span>View Your Listing</span>
              <svg style={{ width: '18px', height: '18px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowSuccess(false);
                  setCreatedListing(null);
                  setFormData({
                    title: '',
                    description: '',
                    price: '',
                    category: 'furniture',
                    condition: 'good',
                  });
                  setPhotos([]);
                  setPhotoPreviews([]);
                  setUploadProgress(0);
                }}
                style={{
                  flex: 1,
                  padding: '0.75rem 1rem',
                  background: 'white',
                  color: '#2563eb',
                  border: '2px solid #2563eb',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#eff6ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                }}
              >
                Create Another
              </button>
              <Link
                to="/"
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
              >
                Browse Listings
              </Link>
            </div>
          </div>

          {/* Info Box */}
          <div style={{
            marginTop: '1.5rem',
            padding: '1rem',
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            borderRadius: '8px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', textAlign: 'left' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                background: '#2563eb', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <svg style={{ width: '16px', height: '16px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 style={{ fontWeight: 600, color: '#1e40af', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                  What happens next?
                </h3>
                <ul style={{ fontSize: '0.8rem', color: '#1e40af', lineHeight: 1.6, paddingLeft: '1.25rem', margin: 0 }}>
                  <li>All community members will see your listing</li>
                  <li>You'll get notified when someone shows interest</li>
                  <li>Interested buyers will appear as "Anonymous" to others</li>
                  <li>You can manage your listing from "My Listings"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @keyframes bounce-in {
            0% {
              transform: scale(0);
              opacity: 0;
            }
            50% {
              transform: scale(1.1);
            }
            100% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
        <p className="mt-2 text-gray-600">Share your item with the community</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="ml-3 text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Photos Upload */}
        <div className="card card-body">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Photos</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
            {photoPreviews.map((preview, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                {index === 0 && (
                  <span className="absolute bottom-2 left-2 badge badge-primary text-xs">
                    Cover
                  </span>
                )}
              </div>
            ))}
            
            {photos.length < 8 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors">
                <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-gray-600">Add Photo</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <p className="text-sm text-gray-500">
            Upload up to 8 photos. First photo will be the cover image.
          </p>
        </div>

        {/* Basic Info */}
        <div className="card card-body space-y-5">
          <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="e.g., Comfortable 3-seater sofa"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={5}
              className="input"
              placeholder="Describe your item in detail..."
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Include condition, dimensions, and any relevant details
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="input pl-7"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input"
              >
                <option value="furniture">🪑 Furniture</option>
                <option value="electronics">💻 Electronics</option>
                <option value="books">📚 Books</option>
                <option value="household">🏠 Household</option>
                <option value="clothing">👕 Clothing</option>
                <option value="other">📦 Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="input"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-outline btn-md"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={createListingMutation.isPending}
            className="btn-primary btn-md"
          >
            {createListingMutation.isPending ? (
              <div className="flex items-center">
                <div className="spinner mr-2 !w-5 !h-5 !border-2"></div>
                {uploadProgress > 0 && `${Math.round(uploadProgress)}%`}
              </div>
            ) : (
              'Create Listing'
            )}
          </button>
        </div>
      </form>
        </div>

        {/* Right side - Preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="card card-body">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
              
              {/* Preview Image */}
              <div className="mb-4">
                {photoPreviews.length > 0 ? (
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={photoPreviews[0]}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    {photoPreviews.length > 1 && (
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        +{photoPreviews.length - 1} more
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-video rounded-lg bg-gray-100 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <svg className="mx-auto h-12 w-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm">No photos yet</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Preview Details */}
              <div className="space-y-3">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-[3rem]">
                    {formData.title || 'Untitled Listing'}
                  </h4>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-b border-gray-200">
                  <span className="text-2xl font-bold text-primary-600">
                    {formData.price ? `$${Number(formData.price).toFixed(2)}` : '$0.00'}
                  </span>
                  <span className="badge badge-primary capitalize">
                    {formData.condition.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {formData.category === 'furniture' && '🪑 Furniture'}
                      {formData.category === 'electronics' && '💻 Electronics'}
                      {formData.category === 'books' && '📚 Books'}
                      {formData.category === 'household' && '🏠 Household'}
                      {formData.category === 'clothing' && '👕 Clothing'}
                      {formData.category === 'other' && '📦 Other'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Photos</span>
                    <span className="font-medium text-gray-900">
                      {photos.length} / 8
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Description</span>
                    <span className="font-medium text-gray-900">
                      {formData.description ? `${formData.description.length} chars` : '0 chars'}
                    </span>
                  </div>
                </div>

                {formData.description && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 line-clamp-4">
                      {formData.description}
                    </p>
                  </div>
                )}

                {/* Completion Status */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Completion</span>
                    <span className="text-sm font-medium text-gray-900">
                      {(() => {
                        let completed = 0;
                        let total = 5;
                        if (formData.title) completed++;
                        if (formData.description) completed++;
                        if (formData.price) completed++;
                        if (photos.length > 0) completed++;
                        if (formData.category && formData.condition) completed++;
                        return `${completed}/${total}`;
                      })()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(() => {
                          let completed = 0;
                          if (formData.title) completed += 20;
                          if (formData.description) completed += 20;
                          if (formData.price) completed += 20;
                          if (photos.length > 0) completed += 20;
                          if (formData.category && formData.condition) completed += 20;
                          return completed;
                        })()}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
