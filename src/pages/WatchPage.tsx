import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  SkipBack,
  SkipForward,
  Server,
  Download,
  ExternalLink,
  ChevronLeft,
  Maximize2,
  Tv,
  Layers,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Film,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { EpisodeDetail, StreamServer, DownloadFormat } from '@/types/anime';
import { ErrorState } from '@/components/ErrorState';
import { useWatchHistory } from '@/hooks/useStorage';

export const WatchPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [activeServer, setActiveServer] = useState<StreamServer | null>(null);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);
  const [isLoadingEp, setIsLoadingEp] = useState(true);
  const [isLoadingServer, setIsLoadingServer] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [activeFormatTab, setActiveFormatTab] = useState<string>('MKV');
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  const { saveProgress } = useWatchHistory();
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch episode data
  useEffect(() => {
    if (!slug) return;
    setIsLoadingEp(true);
    setServerError(null);
    setEmbedSrc(null);
    setEmbedHtml(null);

    apiService
      .getEpisodeDetail(slug)
      .then((data) => {
        setEpisode(data);
        if (data.streamServers && data.streamServers.length > 0) {
          setActiveServer(data.streamServers[0]);
        }
        if (data.downloads && data.downloads.length > 0) {
          setActiveFormatTab(data.downloads[0].format);
        }

        // Auto-save to LocalStorage Watch History
        const parentSlug = data.parentAnime?.slug || slug.replace(/-episode-\d+.*$/, '');
        saveProgress({
          animeSlug: parentSlug,
          episodeSlug: slug,
          episodeTitle: data.title,
          animeTitle: data.parentAnime?.title || data.title.replace(/\s*(Episode|Eps)\s*\d+/i, ''),
          poster: '',
          timestamp: 0,
        });
      })
      .catch((err) => {
        setServerError(err.message || 'Gagal memuat detail episode.');
      })
      .finally(() => {
        setIsLoadingEp(false);
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // 2. Fetch server embed when active server changes
  useEffect(() => {
    if (!activeServer) return;
    setIsLoadingServer(true);
    setEmbedSrc(null);
    setEmbedHtml(null);

    apiService
      .getServerEmbed(activeServer.dataPost, activeServer.dataNume, activeServer.dataType || 'schtml')
      .then((res) => {
        if (res.embedUrl) {
          setEmbedSrc(res.embedUrl);
        } else if (res.html && res.html !== '-1') {
          // If HTML contains an iframe string, extract the src or use raw html
          const matchSrc = res.html.match(/src=["'](.*?)["']/i);
          if (matchSrc && matchSrc[1]) {
            setEmbedSrc(matchSrc[1]);
          } else {
            setEmbedHtml(res.html);
          }
        } else {
          // If server returned -1, we will provide the smart fallback player
          setEmbedSrc(null);
          setEmbedHtml(null);
        }
      })
      .catch((err) => {
        console.warn('Failed to get server embed:', err);
      })
      .finally(() => {
        setIsLoadingServer(false);
      });
  }, [activeServer]);

  // Keyboard navigation for Prev/Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'ArrowLeft' && episode?.navigation?.prevEpisodeSlug) {
        navigate(`/nonton/${episode.navigation.prevEpisodeSlug}`);
      } else if (e.key === 'ArrowRight' && episode?.navigation?.nextEpisodeSlug) {
        navigate(`/nonton/${episode.navigation.nextEpisodeSlug}`);
      } else if (e.key.toLowerCase() === 't') {
        setTheaterMode((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [episode, navigate]);

  if (isLoadingEp) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse">
        <div className="h-4 bg-background-surface rounded w-48" />
        <div className="aspect-video w-full bg-background-surface rounded border border-border-subtle" />
        <div className="h-8 bg-background-surface rounded w-2/3" />
      </div>
    );
  }

  if (serverError || !episode) {
    return (
      <div className="py-20">
        <ErrorState
          title="Gagal Memutar Episode"
          message={serverError || 'Episode tidak ditemukan.'}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // Find alternative stream link from downloads (e.g. Pixeldrain / Acefile / Gofile) for direct fallback
  const fallbackDownloadLinks = (episode.downloads || [])
    .flatMap((fmt) => fmt.resolutions.flatMap((res) => res.links.map((link) => ({ ...link, resolution: res.resolution, format: fmt.format }))))
    .filter((link) => link.server.toLowerCase().includes('pixeldrain') || link.server.toLowerCase().includes('acefile') || link.server.toLowerCase().includes('gofile'));

  const parentSlug = episode.parentAnime?.slug || slug?.replace(/-episode-\d+.*$/, '') || '';

  return (
    <div className="pb-16 space-y-8">
      {/* Top Breadcrumb Bar */}
      <div className="bg-background-surface/80 border-b border-border-subtle py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-neutral-400">
            <Link to="/" className="hover:text-white transition-colors">Beranda</Link>
            <span>/</span>
            {parentSlug && (
              <>
                <Link to={`/anime/${parentSlug}`} className="hover:text-white transition-colors line-clamp-1 max-w-[150px] sm:max-w-none">
                  {episode.parentAnime?.title || 'Detail Anime'}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-white font-medium line-clamp-1">{episode.title}</span>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[11px] text-neutral-500">
            <span>Shortcut: ← Prev | → Next | T Theater</span>
          </div>
        </div>
      </div>

      <div className={`mx-auto px-4 sm:px-6 lg:px-8 space-y-6 ${theaterMode ? 'max-w-full' : 'max-w-7xl'}`}>
        
        {/* Main Player Container */}
        <div ref={playerContainerRef} className="space-y-3">
          <div className="relative aspect-video w-full rounded bg-black border border-border overflow-hidden shadow-elevated">
            
            {/* Loading Indicator */}
            {isLoadingServer && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-xs">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-neutral-300">
                  Menghubungkan ke {activeServer?.serverName || 'server'}...
                </p>
              </div>
            )}

            {/* Video Embed Frame */}
            {embedSrc ? (
              <iframe
                src={embedSrc}
                title={episode.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : embedHtml ? (
              <div
                dangerouslySetInnerHTML={{ __html: embedHtml }}
                className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
              />
            ) : (
              /* Fallback Screen if upstream embed returns -1 */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#111319] to-[#090a0f]">
                <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                  <Play className="w-6 h-6 fill-primary" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  Pemutar Siap Diputar: {activeServer?.serverName || 'Server Utama'}
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mb-5 leading-relaxed">
                  Server ini membatasi pemutaran otomatis lintas domain. Anda dapat memuat server cadangan di bawah ini atau memutar via link streaming langsung.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 max-w-md">
                  {fallbackDownloadLinks.slice(0, 3).map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka {link.server} ({link.resolution})</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quick Player Bar: Prev / Next / Theater */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded bg-background-surface border border-border-subtle text-xs">
            {/* Prev Episode */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => episode.navigation?.prevEpisodeSlug && navigate(`/nonton/${episode.navigation.prevEpisodeSlug}`)}
                disabled={!episode.navigation?.prevEpisodeSlug}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold bg-background-elevated hover:bg-neutral-800 border border-border-subtle text-neutral-300 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
                <span>Prev Episode</span>
              </button>

              <button
                onClick={() => episode.navigation?.nextEpisodeSlug && navigate(`/nonton/${episode.navigation.nextEpisodeSlug}`)}
                disabled={!episode.navigation?.nextEpisodeSlug}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded font-semibold bg-primary hover:bg-primary-hover text-white disabled:opacity-40 disabled:pointer-events-none transition-colors shadow-xs"
              >
                <span>Next Episode</span>
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Title & Theater Toggle */}
            <div className="flex items-center gap-3">
              {parentSlug && (
                <Link
                  to={`/anime/${parentSlug}`}
                  className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Daftar Semua Episode</span>
                </Link>
              )}

              <button
                onClick={() => setTheaterMode(!theaterMode)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border transition-colors ${
                  theaterMode
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background-elevated border-border-subtle text-neutral-400 hover:text-white'
                }`}
                title="Theater Mode"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theater Mode</span>
              </button>
            </div>
          </div>
        </div>

        {/* Streaming Servers Selector Tabs */}
        {episode.streamServers && episode.streamServers.length > 0 && (
          <div className="p-4 rounded bg-background-surface border border-border-subtle space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-300 uppercase tracking-wider">
              <Server className="w-4 h-4 text-primary" />
              <span>Pilihan Server Streaming:</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {episode.streamServers.map((s) => {
                const isActive = activeServer?.id === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => setActiveServer(s)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold border transition-all ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-background-subtle border-border-subtle text-neutral-400 hover:text-white hover:border-neutral-600'
                    }`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{s.serverName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Episode Info Heading */}
        <div className="space-y-2 border-b border-border-subtle pb-4">
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {episode.title}
          </h1>
          {episode.parentAnime?.title && (
            <p className="text-xs text-neutral-400">
              Bagian dari serial anime{' '}
              <Link to={`/anime/${parentSlug}`} className="text-primary font-semibold hover:underline">
                {episode.parentAnime.title}
              </Link>
            </p>
          )}
        </div>

        {/* Download Links Section */}
        {episode.downloads && episode.downloads.length > 0 && (
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-4 bg-primary rounded-xs" />
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  <span>Download Video Subtitle Indonesia</span>
                </h3>
              </div>
            </div>

            {/* Format Tabs (MKV / MP4 / x265) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {episode.downloads.map((fmt) => (
                <button
                  key={fmt.format}
                  onClick={() => setActiveFormatTab(fmt.format)}
                  className={`px-3 py-1.5 rounded text-xs font-bold transition-all border ${
                    activeFormatTab === fmt.format
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background-surface text-neutral-400 border-border-subtle hover:text-white'
                  }`}
                >
                  {fmt.format}
                </button>
              ))}
            </div>

            {/* Resolutions & Links for Selected Format */}
            {(() => {
              const activeFmt = episode.downloads.find((f) => f.format === activeFormatTab) || episode.downloads[0];
              if (!activeFmt) return null;

              return (
                <div className="space-y-3">
                  {activeFmt.resolutions.map((res) => (
                    <div
                      key={res.resolution}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded bg-background-surface border border-border-subtle"
                    >
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-background-elevated border border-border-subtle text-accent-amber font-mono text-xs font-extrabold">
                          {res.resolution}
                        </span>
                        <span className="text-xs text-neutral-400">
                          Kualitas {res.resolution} - {activeFmt.format}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-1.5">
                        {res.links.map((link, idx) => (
                          <a
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-background-subtle hover:bg-neutral-800 border border-border-subtle hover:border-neutral-500 text-neutral-300 hover:text-white text-xs font-medium transition-colors"
                          >
                            <span>{link.server}</span>
                            <ExternalLink className="w-3 h-3 text-neutral-500" />
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </section>
        )}
      </div>
    </div>
  );
};

