import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './app/globals.css';
import App from './App';
import TodayPage from './app/today/page';
import ProgressPage from './app/progress/page';
import ReviewPage from './app/review/page';
import SettingsPage from './app/settings/page';
import HistoryPage from './app/history/page';
import SharedBilanPage from './app/share/SharedBilanPage';

// Service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}

// AMOLED init
const amoled = localStorage.getItem('recomp-amoled') === 'true';
if (amoled) {
  document.documentElement.style.setProperty('--bg-primary', '#000000');
  document.body.style.background = '#000000';
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<App />}>
          <Route index element={<Navigate to="/today" replace />} />
          <Route path="today" element={<TodayPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="review" element={<ReviewPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>
        <Route path="share/:id" element={<SharedBilanPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
