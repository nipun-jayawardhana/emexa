import React, { useEffect, useState } from 'react';

const LogoutPage = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Simulate logout delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Call logout API
        const response = await fetch('http://localhost:5000/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          // Clear any local storage items
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          
          // Clear session storage
          sessionStorage.clear();
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Logout error:', error);
        setIsLoading(false);
      }
    };

    handleLogout();
  }, []);

  const handleLoginRedirect = () => {
    window.location.href = '/login';
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: '#f3f4f6' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center" style={{ backgroundColor: '#f9fafb' }}>
      <div className="bg-white rounded-2xl shadow-xl" style={{ width: '480px', padding: '48px' }}>
        <div className="flex flex-col items-center">
          {/* Success Icon */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ backgroundColor: '#d1fae5', borderRadius: '9999px', padding: '20px', display: 'inline-block' }}>
              <svg 
                width="56"
                height="56"
                fill="none" 
                stroke="#16a34a" 
                viewBox="0 0 24 24"
                strokeWidth={2.5}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>

          {/* Heading */}
          <h1 className="font-bold text-center" style={{ fontSize: '24px', marginBottom: '16px', color: '#111827' }}>
            Successfully Logged Out
          </h1>

          {/* Message */}
          <p className="text-center" style={{ fontSize: '14px', marginBottom: '8px', color: '#6b7280' }}>
            You have been safely logged out of your account.
          </p>
          <p className="text-center" style={{ fontSize: '14px', marginBottom: '40px', color: '#6b7280' }}>
            Thank you for using our platform!
          </p>

          {/* Login Button */}
          <button
            onClick={handleLoginRedirect}
            className="w-full font-semibold rounded-lg transition-colors"
            style={{ 
              padding: '14px 24px', 
              fontSize: '16px',
              backgroundColor: '#0f766e',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#115e59'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#0f766e'}
          >
            Log Back In
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutPage;