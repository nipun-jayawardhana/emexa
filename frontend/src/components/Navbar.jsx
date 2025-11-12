import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/logout');
  };

  return (
    <nav className="bg-teal-600 shadow-lg px-6 py-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-white">My App</h1>
        <button 
          onClick={handleLogout}
          className="bg-white text-teal-600 hover:bg-gray-100 px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;