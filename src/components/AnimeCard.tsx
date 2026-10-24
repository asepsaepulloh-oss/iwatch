import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Play, Bookmark } from 'lucide-react';
import { AnimeCatalogItem, TopAnimeItem } from '@/types/anime';
import { useBookmarks } from '@/hooks/useStorage';

interface AnimeCardProps {
  item: AnimeCatalogItem | TopAnimeItem;
  rank?: number;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ item, rank }) => {
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const bookmarked = isBookmarked(item.slug);

  const cleanScore = item.score?.replace(/[^0-9.]/g, '') || null;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark({
      animeSlug: item.slug,
      title: item.title,
      poster: item.poster,
      score: item.score,
      status: (item as AnimeCatalogItem).status || null,
      addedAt: Date.now(),
    });
  };

  return (
    <div className="group relative flex flex-col bg-background-surface rounded border border-border-subtle hover:border-neutral-600 transition-all duration-200 overflow-hidden shadow-subtle hover:shadow-card">
      <Link to={`/anime/${item.slug}`} className="flex flex-col flex-1">
        {/* Poster Container */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-background-subtle">
          <img
            src={item.poster}
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 ease-out"
          />

          {/* Dark gradient overlay at bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-background-surface via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

          {/* Top-left Rank or Type */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 items-start z-10">
            {rank !== undefined ? (
              <span className="w-6 h-6 rounded bg-primary text-white font-extrabold text-xs flex items-center justify-center shadow-md">
                {rank}
              </span>
            ) : (item as AnimeCatalogItem).type ? (
              <span className="px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm text-[10px] font-semibold text-neutral-300 border border-border-subtle">
                {(item as AnimeCatalogItem).type}
              </span>
            ) : null}
          </div>

          {/* Top-right Score */}
          {cleanScore && (
            <div className="absolute top-2 right-2 z-10 flex items-center gap-1 px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm border border-border-subtle text-[11px] font-bold text-accent-amber">
              <Star className="w-3 h-3 fill-accent-amber text-accent-amber" />
              <span>{cleanScore}</span>
            </div>
          )}

          {/* Center Play Overlay on Hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="w-10 h-10 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-elevated transform scale-90 group-hover:scale-100 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>

          {/* Quick Bookmark Button */}
          <button
            onClick={handleBookmarkClick}
            className={`absolute bottom-2 right-2 p-1.5 rounded bg-background/80 hover:bg-neutral-800 border border-border-subtle text-neutral-300 hover:text-white transition-colors z-20 ${
              bookmarked ? 'text-primary fill-primary' : ''
            }`}
            title={bookmarked ? 'Hapus dari koleksi' : 'Simpan ke koleksi'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>

        {/* Info Container */}
        <div className="p-3 flex flex-col flex-1 justify-between gap-1">
          <h3 className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white line-clamp-2 transition-colors leading-snug">
            {item.title}
          </h3>

          <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
            <span>
              {(item as AnimeCatalogItem).status || (item as TopAnimeItem).releasedOn || 'Sub Indo'}
            </span>
            <span className="text-primary font-medium group-hover:underline">
              Detail
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

