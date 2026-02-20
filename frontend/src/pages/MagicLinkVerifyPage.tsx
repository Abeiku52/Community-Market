import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export default function MagicLinkVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setError('No token provided');
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3000/api/auth/verify-magic-link?token=${token}`);
        
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setStatus('success');
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
          window.location.reload(); // Reload to update auth context
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        setError(err.response?.data?.error || 'Failed to verify magic link');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center animate-fade-in">
        {status === 'verifying' && (
          <>
            <div className="spinner mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verifying...</h2>
            <p className="text-gray-600">Please wait while we log you in</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Success!</h2>
            <p className="text-gray-600">You're now logged in. Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Verification Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/auth/magic-link')}
              className="btn-primary btn-md"
            >
              Request New Link
            </button>
          </>
        )}
      </div>
    </div>
  );
}
