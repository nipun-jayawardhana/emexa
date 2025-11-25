import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles, blockWellness = false }) => {
  const adminToken = localStorage.getItem('adminToken');
  const isAdminViewing = localStorage.getItem('adminViewingAs');
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  // Check authentication
  if (!token && !adminToken) {
    return <Navigate to="/login" replace />;
  }

  // If admin is viewing and trying to access wellness centre, block it
  if (isAdminViewing && adminToken && blockWellness) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md text-center">
          <svg className="w-16 h-16 text-amber-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-600 mb-4">Admin cannot access Wellness Centre in preview mode.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // If admin is viewing, allow access regardless of allowedRoles
  if (isAdminViewing && adminToken) {
    return children;
  }

  // For regular users, check role permissions
  if (allowedRoles && token && !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;