import { WatchHistoryItem, BookmarkItem } from '@/types/anime';

const HISTORY_STORAGE_KEY = 'iwatch_history_v1';
const BOOKMARKS_STORAGE_KEY = 'iwatch_bookmarks_v1';
const MAX_HISTORY_ITEMS = 50;

export const historyService = {
  /**
   * Mengambil seluruh riwayat tontonan
   */
  getHistory(): WatchHistoryItem[] {
    try {
      const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Menyimpan / memperbarui progres tontonan suatu episode
   */
  saveProgress(item: Omit<WatchHistoryItem, 'watchedAt'>): void {
    try {
      const current = this.getHistory();
      // Hapus jika sudah pernah ada episode yang sama untuk diletakkan di paling atas
      const filtered = current.filter((h) => h.episodeSlug !== item.episodeSlug);

      const newItem: WatchHistoryItem = {
        ...item,
        watchedAt: Date.now(),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));

      // Dispatch custom event agar komponen React dapat bereaksi instan
      window.dispatchEvent(new Event('iwatch_history_updated'));
    } catch (err) {
      console.warn('Gagal menyimpan riwayat tontonan:', err);
    }
  },

  /**
   * Mencari episode terakhir yang ditonton untuk anime tertentu
   */
  getLastWatched(animeSlug: string): WatchHistoryItem | null {
    const list = this.getHistory();
    return list.find((item) => item.animeSlug === animeSlug) || null;
  },

  /**
   * Hapus satu item dari riwayat
   */
  removeFromHistory(episodeSlug: string): void {
    try {
      const current = this.getHistory();
      const updated = current.filter((h) => h.episodeSlug !== episodeSlug);
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('iwatch_history_updated'));
    } catch (err) {
      console.warn('Gagal menghapus riwayat:', err);
    }
  },

  /**
   * Bersihkan semua riwayat
   */
  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
      window.dispatchEvent(new Event('iwatch_history_updated'));
    } catch (err) {
      console.warn('Gagal membersihkan riwayat:', err);
    }
  },

  /**
   * Mengambil daftar bookmark / favorit
   */
  getBookmarks(): BookmarkItem[] {
    try {
      const raw = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  /**
   * Cek apakah anime sudah di-bookmark
   */
  isBookmarked(animeSlug: string): boolean {
    const bookmarks = this.getBookmarks();
    return bookmarks.some((b) => b.animeSlug === animeSlug);
  },

  /**
   * Toggle status bookmark (tambah / hapus)
   */
  toggleBookmark(item: BookmarkItem): boolean {
    try {
      const current = this.getBookmarks();
      const exists = current.some((b) => b.animeSlug === item.animeSlug);
      let updated: BookmarkItem[];

      if (exists) {
        updated = current.filter((b) => b.animeSlug !== item.animeSlug);
      } else {
        updated = [{ ...item, addedAt: Date.now() }, ...current];
      }

      localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event('iwatch_bookmarks_updated'));
      return !exists;
    } catch (err) {
      console.warn('Gagal toggle bookmark:', err);
      return false;
    }
  },
};

