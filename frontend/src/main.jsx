
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import './index.css';
import SecondPage from './pages/SecondPage';
import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <BrowserRouter>
        <Routes>
            <Route path="/" element={<App />} />
            <Route path="/second" element={<SecondPage />} />
            {/* add protected routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
  </StrictMode>
)
