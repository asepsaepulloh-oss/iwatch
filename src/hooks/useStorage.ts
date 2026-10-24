import { useState, useEffect } from 'react';
import { historyService } from '@/services/history';
import { WatchHistoryItem, BookmarkItem } from '@/types/anime';

export function useWatchHistory() {
  const [history, setHistory] = useState<WatchHistoryItem[]>(() => historyService.getHistory());

  useEffect(() => {
    const handleUpdate = () => {
      setHistory(historyService.getHistory());
    };

    window.addEventListener('iwatch_history_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('iwatch_history_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    history,
    saveProgress: historyService.saveProgress.bind(historyService),
    getLastWatched: historyService.getLastWatched.bind(historyService),
    removeFromHistory: historyService.removeFromHistory.bind(historyService),
    clearHistory: historyService.clearHistory.bind(historyService),
  };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => historyService.getBookmarks());

  useEffect(() => {
    const handleUpdate = () => {
      setBookmarks(historyService.getBookmarks());
    };

    window.addEventListener('iwatch_bookmarks_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('iwatch_bookmarks_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    bookmarks,
    isBookmarked: historyService.isBookmarked.bind(historyService),
    toggleBookmark: historyService.toggleBookmark.bind(historyService),
  };
}

