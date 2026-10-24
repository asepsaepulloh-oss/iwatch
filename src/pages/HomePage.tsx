import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  Clock,
  Sparkles,
  ChevronRight,
  Play,
  RotateCcw,
} from 'lucide-react';
import { apiService } from '@/services/api';
import {
  TopAnimeItem,
  LatestEpisodeItem,
  AnimeCatalogItem,
} from '@/types/anime';
import { HeroBanner } from '@/components/HeroBanner';
import { EpisodeCard } from '@/components/EpisodeCard';
import { AnimeCard } from '@/components/AnimeCard';
import { GridSkeleton, HeroSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useWatchHistory } from '@/hooks/useStorage';

export const HomePage: React.FC = () => {
  const [top10, setTop10] = useState<TopAnimeItem[]>([]);
  const [latestEpisodes, setLatestEpisodes] = useState<LatestEpisodeItem[]>([]);
  const [popularAnime, setPopularAnime] = useState<AnimeCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { history } = useWatchHistory();
  const recentHistory = history.slice(0, 4);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [topRes, latestRes, catalogRes] = await Promise.all([
        apiService.getTop10().catch(() => ({ data: [] })),
        apiService.getLatest(1).catch(() => ({ data: [] })),
        apiService.getCatalog(1).catch(() => ({ data: [] })),
      ]);

      setTop10(topRes.data || []);
      setLatestEpisodes(latestRes.data || []);
      setPopularAnime(catalogRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data beranda.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8">
        <HeroSkeleton />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 py-8">
          <div className="space-y-4">
            <div className="h-6 bg-background-surface rounded w-48 animate-pulse" />
            <GridSkeleton count={8} aspect="landscape" />
          </div>
          <div className="space-y-4">
            <div className="h-6 bg-background-surface rounded w-48 animate-pulse" />
            <GridSkeleton count={12} aspect="poster" />
          </div>
        </div>
      </div>
    );
  }

  if (error && top10.length === 0 && latestEpisodes.length === 0) {
    return (
      <div className="py-20">
        <ErrorState message={error} onRetry={loadData} />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      {top10.length > 0 && <HeroBanner items={top10} />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Continue Watching (Riwayat Tontonan Cepat) */}
        {recentHistory.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-xs" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary" />
                  <span>Lanjutkan Menonton</span>
                </h2>
              </div>
              <Link
                to="/riwayat"
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Semua Riwayat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {recentHistory.map((h) => (
                <Link
                  key={h.episodeSlug}
                  to={`/nonton/${h.episodeSlug}`}
                  className="group flex gap-3 p-2.5 rounded bg-background-surface border border-border-subtle hover:border-neutral-600 transition-all shadow-subtle hover:shadow-card"
                >
                  <img
                    src={h.poster}
                    alt={h.episodeTitle}
                    className="w-16 h-20 object-cover rounded bg-background-subtle flex-shrink-0"
                  />
                  <div className="flex flex-col justify-between flex-1 min-w-0">
                    <div>
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
                        Terakhir Ditonton
                      </span>
                      <h4 className="text-xs font-bold text-neutral-200 group-hover:text-white line-clamp-1 mt-0.5">
                        {h.animeTitle || h.episodeTitle}
                      </h4>
                      <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                        {h.episodeTitle}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                      <Play className="w-3 h-3 fill-primary" />
                      <span>Lanjut Nonton</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Latest Episodes Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border-subtle pb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-primary rounded-xs" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>Episode Terbaru Rilis</span>
              </h2>
            </div>
            <Link
              to="/katalog?order=latest"
              className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <span>Lihat Semua</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {latestEpisodes.slice(0, 8).map((ep) => (
              <EpisodeCard key={ep.animeSlug} item={ep} />
            ))}
          </div>
        </section>

        {/* Top 10 Leaderboard Strip */}
        {top10.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-xs" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  <span>Top 10 Minggu Ini</span>
                </h2>
              </div>
              <Link
                to="/top-10"
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Lihat Peringkat</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {top10.slice(0, 6).map((item, idx) => (
                <AnimeCard key={item.slug} item={item} rank={idx + 1} />
              ))}
            </div>
          </section>
        )}

        {/* Popular Anime Catalog Preview */}
        {popularAnime.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-xs" />
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span>Katalog Anime Populer</span>
                </h2>
              </div>
              <Link
                to="/katalog?order=popular"
                className="text-xs font-semibold text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Jelajahi Katalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {popularAnime.slice(0, 12).map((item) => (
                <AnimeCard key={item.slug} item={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

