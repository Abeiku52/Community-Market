import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { messagesAPI, notificationsAPI } from '../services/api';
import { useState, useEffect } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Invalidate all queries when location changes (navigation)
  useEffect(() => {
    queryClient.invalidateQueries();
  }, [location.pathname, queryClient]);

  const { data: unreadMessages = 0 } = useQuery({
    queryKey: ['unreadMessages'],
    queryFn: () => messagesAPI.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  useQuery({
    queryKey: ['unreadNotifications'],
    queryFn: () => notificationsAPI.getUnreadCount(),
    enabled: !!user,
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #f1f5f9',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
      }}>
        <nav style={{ maxWidth: '80rem', margin: '0 auto', padding: '0 1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4rem' }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
              <div style={{
                width: '2rem',
                height: '2rem',
                background: '#0f172a',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', letterSpacing: '-0.02em' }}>
                CommunityMarket
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
              <Link
                to="/"
                style={{
                  padding: '0.5rem 0.875rem',
                  borderRadius: '6px',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  background: isActive('/') ? '#f8fafc' : 'transparent',
                  color: isActive('/') ? '#0f172a' : '#64748b',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.background = '#f8fafc';
                    e.currentTarget.style.color = '#0f172a';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/')) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                Browse
              </Link>
              
              {user && (
                <>
                  <Link
                    to="/create-listing"
                    style={{
                      padding: '0.5rem 0.875rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      background: isActive('/create-listing') ? '#f8fafc' : 'transparent',
                      color: isActive('/create-listing') ? '#0f172a' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/create-listing')) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/create-listing')) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                      }
                    }}
                  >
                    Sell Item
                  </Link>
                  <Link
                    to="/my-listings"
                    style={{
                      padding: '0.5rem 0.875rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      background: isActive('/my-listings') ? '#f8fafc' : 'transparent',
                      color: isActive('/my-listings') ? '#0f172a' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/my-listings')) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/my-listings')) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                      }
                    }}
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/favorites"
                    style={{
                      padding: '0.5rem 0.875rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      background: isActive('/favorites') ? '#f8fafc' : 'transparent',
                      color: isActive('/favorites') ? '#0f172a' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/favorites')) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/favorites')) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                      }
                    }}
                  >
                    Favorites
                  </Link>
                  <Link
                    to="/messages"
                    style={{
                      position: 'relative',
                      padding: '0.5rem 0.875rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      textDecoration: 'none',
                      background: isActive('/messages') ? '#f8fafc' : 'transparent',
                      color: isActive('/messages') ? '#0f172a' : '#64748b',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive('/messages')) {
                        e.currentTarget.style.background = '#f8fafc';
                        e.currentTarget.style.color = '#0f172a';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive('/messages')) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = '#64748b';
                      }
                    }}
                  >
                    Messages
                    {unreadMessages > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '0.25rem',
                        right: '0.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '1.125rem',
                        height: '1.125rem',
                        borderRadius: '9999px',
                        background: '#ef4444',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        color: 'white',
                        padding: '0 0.25rem',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
                      }}>
                        {unreadMessages}
                      </span>
                    )}
                  </Link>
                </>
              )}
            </div>

            {/* User Menu */}
            <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
              {user ? (
                <>
                  <Link
                    to={`/profile/${user.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.375rem 0.75rem', borderRadius: '6px', textDecoration: 'none', transition: 'all 0.2s' }}
                    className="hover:bg-gray-50"
                  >
                    <div style={{
                      width: '1.75rem',
                      height: '1.75rem',
                      borderRadius: '9999px',
                      background: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '0.75rem'
                    }}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#334155' }}>{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn btn-outline btn-sm"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-outline btn-sm">
                    Login
                  </Link>
                  <Link to="/register" className="btn btn-primary btn-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'block',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                color: '#374151',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
              className="mobile-menu-btn"
            >
              <svg style={{ width: '1.5rem', height: '1.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div style={{ padding: '1rem 0', borderTop: '1px solid #f1f5f9' }} className="animate-slide-down mobile-menu">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <Link
                  to="/"
                  style={{ 
                    display: 'block', 
                    padding: '0.625rem 1rem', 
                    borderRadius: '6px', 
                    fontSize: '0.875rem', 
                    fontWeight: 500, 
                    color: isActive('/') ? '#0f172a' : '#64748b',
                    background: isActive('/') ? '#f8fafc' : 'transparent',
                    textDecoration: 'none',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Browse
                </Link>
                {user && (
                  <>
                    <Link
                      to="/create-listing"
                      style={{ 
                        display: 'block', 
                        padding: '0.625rem 1rem', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: isActive('/create-listing') ? '#0f172a' : '#64748b',
                        background: isActive('/create-listing') ? '#f8fafc' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sell Item
                    </Link>
                    <Link
                      to="/my-listings"
                      style={{ 
                        display: 'block', 
                        padding: '0.625rem 1rem', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: isActive('/my-listings') ? '#0f172a' : '#64748b',
                        background: isActive('/my-listings') ? '#f8fafc' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Listings
                    </Link>
                    <Link
                      to="/favorites"
                      style={{ 
                        display: 'block', 
                        padding: '0.625rem 1rem', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: isActive('/favorites') ? '#0f172a' : '#64748b',
                        background: isActive('/favorites') ? '#f8fafc' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Favorites
                    </Link>
                    <Link
                      to="/messages"
                      style={{ 
                        display: 'block', 
                        padding: '0.625rem 1rem', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: isActive('/messages') ? '#0f172a' : '#64748b',
                        background: isActive('/messages') ? '#f8fafc' : 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Messages {unreadMessages > 0 && `(${unreadMessages})`}
                    </Link>
                    <Link
                      to={`/profile/${user.id}`}
                      style={{ 
                        display: 'block', 
                        padding: '0.625rem 1rem', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: '#64748b',
                        background: 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <div style={{ height: '1px', background: '#f1f5f9', margin: '0.5rem 0' }}></div>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      style={{ 
                        display: 'block', 
                        width: '100%', 
                        textAlign: 'left', 
                        padding: '0.625rem 1rem', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: '#ef4444',
                        background: 'none', 
                        border: 'none', 
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Logout
                    </button>
                  </>
                )}
                {!user && (
                  <>
                    <Link
                      to="/login"
                      style={{ 
                        display: 'block', 
                        padding: '0.625rem 1rem', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 500, 
                        color: '#64748b',
                        background: 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      style={{ 
                        display: 'block', 
                        padding: '0.625rem 1rem', 
                        borderRadius: '6px', 
                        fontSize: '0.875rem', 
                        fontWeight: 600, 
                        color: '#0ea5e9',
                        background: 'transparent',
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, maxWidth: '80rem', width: '100%', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer style={{ background: '#fafafa', borderTop: '1px solid #f1f5f9', marginTop: 'auto' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '3rem 1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="footer-grid">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '1rem' }}>
                <div style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  background: '#0f172a',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <svg style={{ width: '1.125rem', height: '1.125rem', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a' }}>LincolnMarket</span>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '28rem', lineHeight: 1.6 }}>
                A trusted community marketplace. Buy and sell items safely within your community.
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.875rem' }}>Quick Links</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <li><Link to="/" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-slate-900">Browse Listings</Link></li>
                  <li><Link to="/create-listing" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-slate-900">Sell an Item</Link></li>
                  <li><Link to="/about" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-slate-900">About Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.875rem' }}>Support</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <li><Link to="/help" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-slate-900">Help Center</Link></li>
                  <li><a href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-slate-900">Safety Tips</a></li>
                  <li><a href="mailto:support@lincoln.edu.gh" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-slate-900">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', textAlign: 'center' }}>
              © {new Date().getFullYear()} CommunityMarket. Made with care for communities everywhere.
            </p>
          </div>
        </div>
      </footer>

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-menu-btn {
            display: none !important;
          }
          .mobile-menu {
            display: none !important;
          }
          .footer-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
        
        .hover\:text-slate-900:hover {
          color: #0f172a;
        }
        
        .hover\:bg-gray-50:hover {
          background-color: #f8fafc;
        }
      `}</style>
    </div>
  );
}
