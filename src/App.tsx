import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HomePage } from '@/pages/HomePage';
import { CatalogPage } from '@/pages/CatalogPage';
import { SchedulePage } from '@/pages/SchedulePage';
import { Top10Page } from '@/pages/Top10Page';
import { AnimeDetailPage } from '@/pages/AnimeDetailPage';
import { WatchPage } from '@/pages/WatchPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { BookmarksPage } from '@/pages/BookmarksPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-background text-neutral-100">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/katalog" element={<CatalogPage />} />
            <Route path="/jadwal" element={<SchedulePage />} />
            <Route path="/top-10" element={<Top10Page />} />
            <Route path="/anime/:slug" element={<AnimeDetailPage />} />
            <Route path="/nonton/:slug" element={<WatchPage />} />
            <Route path="/riwayat" element={<HistoryPage />} />
            <Route path="/koleksi" element={<BookmarksPage />} />
            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};

export default App;

