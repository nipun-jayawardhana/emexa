import React from 'react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Your App
        </h1>
        <p className="text-gray-600 mb-8">
          This is your home page. Click Logout in the navbar to test the logout functionality.
        </p>
      </div>
    </div>
  );
};

export default Home;