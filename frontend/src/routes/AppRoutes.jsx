import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LogoutPage from '../pages/logout';
// ... other imports

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* ... other routes */}
        <Route path="/logout" element={<LogoutPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;