import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import './index.css';
import Home from './pages/Home';
import SecondPage from './pages/SecondPage';

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/second" element={<SecondPage />} />
            {/* add protected routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
  </StrictMode>
)
