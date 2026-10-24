import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Star, ArrowRight, Play, Trash2 } from 'lucide-react';
import { useBookmarks } from '@/hooks/useStorage';

export const BookmarksPage: React.FC = () => {
  const { bookmarks, toggleBookmark } = useBookmarks();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-xs" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-primary fill-primary" />
            <span>Koleksi Anime Tersimpan</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400">
          Daftar anime favorit yang kamu simpan untuk ditonton nanti.
        </p>
      </div>

      {bookmarks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {bookmarks.map((item) => (
            <div
              key={item.animeSlug}
              className="group relative flex flex-col bg-background-surface rounded border border-border-subtle hover:border-neutral-600 transition-all duration-200 overflow-hidden shadow-subtle hover:shadow-card"
            >
              <Link to={`/anime/${item.animeSlug}`} className="relative aspect-[3/4] w-full overflow-hidden bg-background-subtle">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background-surface via-transparent to-transparent opacity-80" />

                {item.score && (
                  <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm border border-border-subtle text-[11px] font-bold text-accent-amber">
                    <Star className="w-3 h-3 fill-accent-amber text-accent-amber" />
                    <span>{item.score.replace(/[^0-9.]/g, '')}</span>
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleBookmark(item);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 rounded bg-background/80 hover:bg-primary border border-border-subtle text-white transition-colors z-20"
                  title="Hapus dari koleksi"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </Link>

              <div className="p-3 flex flex-col justify-between flex-1 gap-1">
                <Link
                  to={`/anime/${item.animeSlug}`}
                  className="text-xs font-semibold text-neutral-200 group-hover:text-primary line-clamp-2 transition-colors"
                >
                  {item.title}
                </Link>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                  <span>{item.status || 'Tersimpan'}</span>
                  <Link
                    to={`/anime/${item.animeSlug}`}
                    className="text-primary font-medium hover:underline flex items-center gap-0.5"
                  >
                    <span>Buka</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-background-surface rounded border border-border-subtle space-y-4">
          <Bookmark className="w-10 h-10 text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-200">
              Koleksi anime masih kosong
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Simpan anime favoritmu dengan menekan tombol Koleksi / Bookmark di poster anime untuk melihatnya di sini.
            </p>
          </div>
          <div>
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors"
            >
              <span>Jelajahi Katalog Anime</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

