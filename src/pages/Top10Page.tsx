import React, { useState, useEffect } from 'react';
import { Flame, Star, Play, ChevronRight, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { TopAnimeItem } from '@/types/anime';
import { GridSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';

export const Top10Page: React.FC = () => {
  const [topItems, setTopItems] = useState<TopAnimeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTop10 = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await apiService.getTop10();
      setTopItems(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat Top 10 anime.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTop10();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-xs" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-primary" />
            <span>Top 10 Anime Terpopuler Minggu Ini</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400">
          Daftar 10 anime paling banyak ditonton dan memiliki antusiasme tertinggi sepanjang minggu ini.
        </p>
      </div>

      {isLoading ? (
        <GridSkeleton count={10} aspect="landscape" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadTop10} />
      ) : topItems.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topItems.map((item, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={item.slug}
                  className={`group relative flex items-center gap-4 p-4 rounded bg-background-surface border transition-all duration-200 shadow-subtle hover:shadow-card ${
                    isTop3
                      ? 'border-border-strong hover:border-primary'
                      : 'border-border-subtle hover:border-neutral-600'
                  }`}
                >
                  {/* Huge Rank Number */}
                  <div className="flex-shrink-0 w-12 text-center">
                    <span
                      className={`text-3xl sm:text-4xl font-black italic tracking-tighter ${
                        rank === 1
                          ? 'text-primary'
                          : rank === 2
                          ? 'text-accent-amber'
                          : rank === 3
                          ? 'text-white'
                          : 'text-neutral-600'
                      }`}
                    >
                      #{rank}
                    </span>
                  </div>

                  {/* Thumbnail Poster */}
                  <Link
                    to={`/anime/${item.slug}`}
                    className="relative w-20 sm:w-24 aspect-[3/4] rounded overflow-hidden flex-shrink-0 bg-background-subtle group-hover:scale-102 transition-transform"
                  >
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                  </Link>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-1 h-full">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {item.score && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-amber">
                            <Star className="w-3 h-3 fill-accent-amber" />
                            {item.score.replace(/[^0-9.]/g, '')}
                          </span>
                        )}
                        {item.releasedOn && (
                          <span className="text-[10px] text-neutral-400">
                            • {item.releasedOn}
                          </span>
                        )}
                      </div>

                      <Link
                        to={`/anime/${item.slug}`}
                        className="text-sm sm:text-base font-bold text-neutral-100 group-hover:text-primary transition-colors line-clamp-1"
                      >
                        {item.title}
                      </Link>

                      <p className="text-xs text-neutral-400 line-clamp-1 mt-1">
                        {item.postedBy ? `Oleh: ${item.postedBy}` : 'Tersedia Subtitle Indonesia'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-3">
                      <Link
                        to={`/anime/${item.slug}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
                      >
                        <Play className="w-3 h-3 fill-white" />
                        <span>Tonton</span>
                      </Link>
                      <Link
                        to={`/anime/${item.slug}`}
                        className="text-xs text-neutral-400 hover:text-white font-medium transition-colors"
                      >
                        Detail Anime
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-background-surface rounded border border-border-subtle">
          <TrendingUp className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400 text-sm">Top 10 sedang diperbarui.</p>
        </div>
      )}
    </div>
  );
};

