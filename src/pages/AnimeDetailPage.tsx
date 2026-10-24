import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Play,
  Bookmark,
  Share2,
  Calendar,
  Tv,
  Clock,
  Layers,
  ArrowUpDown,
  Search,
  Check,
} from 'lucide-react';
import { apiService, extractEpisodeNumber } from '@/services/api';
import { AnimeDetail, EpisodeSummary } from '@/types/anime';
import { DetailSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';
import { useWatchHistory, useBookmarks } from '@/hooks/useStorage';

export const AnimeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sortAsc, setSortAsc] = useState(false);
  const [epSearch, setEpSearch] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);

  const { getLastWatched } = useWatchHistory();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const loadDetail = async () => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getAnimeDetail(slug);
      setAnime(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat detail anime.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error || !anime) {
    return (
      <div className="py-20">
        <ErrorState message={error || 'Anime tidak ditemukan.'} onRetry={loadDetail} />
      </div>
    );
  }

  const cleanScore = anime.score?.replace(/[^0-9.]/g, '') || null;
  const lastWatched = slug ? getLastWatched(slug) : null;
  const bookmarked = slug ? isBookmarked(slug) : false;

  // Episode sorting and filtering
  const rawEpisodes = [...(anime.episodeList || [])];
  const sortedEpisodes = sortAsc ? rawEpisodes.reverse() : rawEpisodes;
  const filteredEpisodes = sortedEpisodes.filter((ep) =>
    ep.title.toLowerCase().includes(epSearch.toLowerCase()) ||
    ep.slug.toLowerCase().includes(epSearch.toLowerCase())
  );

  // Determine watch starting point:
  // If user watched an episode, continue that episode. Otherwise start with first episode.
  const firstEpisodeSlug =
    rawEpisodes.length > 0 ? rawEpisodes[rawEpisodes.length - 1]?.slug || rawEpisodes[0]?.slug : '';
  const watchTargetSlug = lastWatched ? lastWatched.episodeSlug : firstEpisodeSlug;
  const watchButtonLabel = lastWatched
    ? `Lanjutkan ${lastWatched.episodeTitle || 'Episode Terakhir'}`
    : 'Mulai Nonton Episode 1';

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: anime.title,
        text: `Tonton anime ${anime.title} subtitle Indonesia di iWatch`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleBookmarkToggle = () => {
    if (!slug) return;
    toggleBookmark({
      animeSlug: slug,
      title: anime.title,
      poster: anime.poster,
      score: anime.score,
      status: anime.status,
      addedAt: Date.now(),
    });
  };

  return (
    <div className="pb-16 space-y-10">
      {/* Editorial Backdrop / Banner */}
      <div className="relative w-full h-[260px] sm:h-[340px] overflow-hidden bg-background border-b border-border-subtle">
        <img
          src={anime.poster}
          alt={anime.title}
          className="w-full h-full object-cover object-top opacity-20 filter blur-sm scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
      </div>

      {/* Main Info Section (Overlapping the banner) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-36 sm:-mt-48 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          
          {/* Vertical Poster Column */}
          <div className="md:col-span-1 lg:col-span-1 space-y-4">
            <div className="aspect-[3/4] rounded overflow-hidden border border-border shadow-elevated bg-background-surface">
              <img
                src={anime.poster}
                alt={anime.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Quick Actions (Bookmark & Share) */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleBookmarkToggle}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded text-xs font-semibold border transition-all ${
                  bookmarked
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-background-surface border-border-subtle text-neutral-300 hover:text-white hover:bg-background-elevated'
                }`}
              >
                <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-primary' : ''}`} />
                <span>{bookmarked ? 'Tersimpan' : 'Koleksi'}</span>
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded bg-background-surface border border-border-subtle text-neutral-400 hover:text-white hover:bg-background-elevated transition-colors"
                title="Bagikan Tautan"
              >
                {copied ? <Check className="w-4 h-4 text-accent-emerald" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Details & Synopsis Column */}
          <div className="md:col-span-3 lg:col-span-4 space-y-6">
            
            {/* Title & Metadata Badges */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                {anime.status && (
                  <span className="px-2.5 py-0.5 rounded bg-primary text-white text-xs font-bold uppercase tracking-wide">
                    {anime.status}
                  </span>
                )}
                {anime.type && (
                  <span className="px-2.5 py-0.5 rounded bg-background-elevated border border-border-subtle text-neutral-300 text-xs font-medium">
                    {anime.type}
                  </span>
                )}
                {cleanScore && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-background-elevated border border-border-subtle text-accent-amber text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-accent-amber" />
                    <span>{cleanScore}</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {anime.title}
              </h1>

              {anime.japaneseTitle && (
                <p className="text-xs sm:text-sm text-neutral-400 font-medium italic">
                  {anime.japaneseTitle}
                </p>
              )}
            </div>

            {/* Quick Watch Button */}
            {watchTargetSlug && (
              <div className="pt-1">
                <Link
                  to={`/nonton/${watchTargetSlug}`}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded bg-primary hover:bg-primary-hover text-white text-sm font-bold shadow-card transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{watchButtonLabel}</span>
                </Link>
              </div>
            )}

            {/* Anime Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded bg-background-surface border border-border-subtle text-xs">
              <div>
                <span className="text-neutral-500 block text-[11px]">Total Episode</span>
                <span className="text-neutral-200 font-semibold">{anime.totalEpisodes || 'Sedang Tayang'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Studio Animasi</span>
                <span className="text-neutral-200 font-semibold">{anime.studio || 'N/A'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Durasi per Ep</span>
                <span className="text-neutral-200 font-semibold">{anime.duration || '24 Menit'}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Tanggal Rilis</span>
                <span className="text-neutral-200 font-semibold">{anime.releaseDate || 'Musim Ini'}</span>
              </div>
            </div>

            {/* Genres */}
            {anime.genres && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Genre & Kategori
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(Array.isArray(anime.genres) ? anime.genres : []).map((genre: any, i: number) => {
                    const name = typeof genre === 'string' ? genre : genre.name;
                    const gSlug = typeof genre === 'string' ? genre.toLowerCase().replace(/\s+/g, '-') : genre.slug;
                    return (
                      <Link
                        key={i}
                        to={`/katalog?genre=${gSlug}`}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-background-elevated hover:bg-neutral-800 border border-border-subtle text-neutral-300 hover:text-white transition-colors"
                      >
                        {name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Synopsis */}
            {anime.synopsis && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Sinopsis Cerita
                </h4>
                <div className="text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2">
                  <p className={!isSynopsisExpanded ? 'line-clamp-4' : ''}>
                    {anime.synopsis}
                  </p>
                  {anime.synopsis.length > 250 && (
                    <button
                      onClick={() => setIsSynopsisExpanded(!isSynopsisExpanded)}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      {isSynopsisExpanded ? 'Sembunyikan' : 'Baca Selengkapnya...'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Episode List Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-primary rounded-xs" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              <span>Daftar Seluruh Episode</span>
              <span className="text-xs px-2 py-0.5 rounded bg-background-elevated border border-border-subtle text-neutral-400 font-normal">
                {rawEpisodes.length} Episode
              </span>
            </h2>
          </div>

          {/* Episode Search & Sort Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-48">
              <input
                type="text"
                placeholder="Cari nomor/judul ep..."
                value={epSearch}
                onChange={(e) => setEpSearch(e.target.value)}
                className="w-full bg-background-surface text-xs text-neutral-200 placeholder-neutral-500 rounded pl-7 pr-3 py-1.5 border border-border-subtle focus:border-neutral-500 focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>

            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background-surface hover:bg-background-elevated border border-border-subtle text-xs text-neutral-300 font-medium transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>{sortAsc ? 'Episode 1 -> Terbaru' : 'Terbaru -> Episode 1'}</span>
            </button>
          </div>
        </div>

        {/* Episode Items Grid / List */}
        {filteredEpisodes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filteredEpisodes.map((ep) => {
              const epNum = ep.episodeNumber || extractEpisodeNumber(ep.title) || extractEpisodeNumber(ep.slug);
              const isWatched = lastWatched?.episodeSlug === ep.slug;

              return (
                <Link
                  key={ep.slug}
                  to={`/nonton/${ep.slug}`}
                  className={`group flex items-center gap-3 p-3 rounded bg-background-surface border transition-all duration-200 hover:border-neutral-600 ${
                    isWatched
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border-subtle'
                  }`}
                >
                  <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                    isWatched
                      ? 'bg-primary text-white'
                      : 'bg-background-elevated text-neutral-300 group-hover:bg-primary group-hover:text-white'
                  }`}>
                    {epNum !== null ? epNum : <Play className="w-3 h-3 fill-current" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-white line-clamp-1">
                      {ep.title}
                    </h4>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      {ep.releaseDate || (isWatched ? 'Pernah Ditonton' : 'Tersedia Sub Indo')}
                    </span>
                  </div>

                  <Play className="w-3.5 h-3.5 text-neutral-600 group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-background-surface rounded border border-border-subtle text-xs text-neutral-400">
            Tidak ada episode yang cocok dengan pencarian "{epSearch}".
          </div>
        )}
      </div>
    </div>
  );
};

