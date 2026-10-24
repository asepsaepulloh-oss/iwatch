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
  Zap,
  MonitorPlay,
  Check,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { EpisodeDetail, StreamServer, DownloadFormat } from '@/types/anime';
import { ErrorState } from '@/components/ErrorState';
import { useWatchHistory } from '@/hooks/useStorage';

interface PlayableStream {
  format: string;
  resolution: string;
  server: string;
  streamUrl: string;
  type: 'video' | 'iframe';
}

export const WatchPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);
  const [playableStreams, setPlayableStreams] = useState<PlayableStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<PlayableStream | null>(null);

  // Player mode: 'direct' (HTML5 video), 'acefile' (Iframe player), 'server' (Samehadaku API)
  const [playerMode, setPlayerMode] = useState<'direct' | 'acefile' | 'server'>('direct');

  // Samehadaku API server state
  const [activeServer, setActiveServer] = useState<StreamServer | null>(null);
  const [embedSrc, setEmbedSrc] = useState<string | null>(null);
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);
  const [serverStatus, setServerStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading');

  const [isLoadingEp, setIsLoadingEp] = useState(true);
  const [activeFormatTab, setActiveFormatTab] = useState<string>('MKV');
  const [theaterMode, setTheaterMode] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<boolean>(false);

  const { saveProgress } = useWatchHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch episode data & extract direct playable streams
  useEffect(() => {
    if (!slug) return;
    setIsLoadingEp(true);
    setEmbedSrc(null);
    setEmbedHtml(null);
    setVideoError(false);

    apiService
      .getEpisodeDetail(slug)
      .then((data) => {
        setEpisode(data);

        // Extract direct playable streams from downloads
        const extracted: PlayableStream[] = [];
        const downloads = data.downloads || [];

        // Preferred formats order: MP4 first (broadest browser support), then x265, then MKV
        const sortedDownloads = [...downloads].sort((a, b) => {
          if (a.format.includes('MP4')) return -1;
          if (b.format.includes('MP4')) return 1;
          return 0;
        });

        for (const fmt of sortedDownloads) {
          for (const res of fmt.resolutions || []) {
            for (const link of res.links || []) {
              // 1. Pixeldrain Direct (Direct MP4/MKV video stream)
              const pixelMatch = link.url.match(/pixeldrain\.com\/u\/([a-zA-Z0-9_-]+)/);
              if (pixelMatch && pixelMatch[1]) {
                extracted.push({
                  format: fmt.format,
                  resolution: res.resolution,
                  server: 'Pixeldrain Direct',
                  streamUrl: `https://pixeldrain.com/api/file/${pixelMatch[1]}`,
                  type: 'video',
                });
              }

              // 2. Acefile Player (Direct iframe player embed)
              const aceMatch = link.url.match(/acefile\.co\/f\/(\d+)/);
              if (aceMatch && aceMatch[1]) {
                extracted.push({
                  format: fmt.format,
                  resolution: res.resolution,
                  server: 'Acefile Player',
                  streamUrl: `https://acefile.co/player/${aceMatch[1]}`,
                  type: 'iframe',
                });
              }
            }
          }
        }

        setPlayableStreams(extracted);

        // Auto select best stream (preferred 720p or 480p or first available)
        if (extracted.length > 0) {
          const preferred =
            extracted.find((s) => s.resolution === '720p' && s.type === 'video') ||
            extracted.find((s) => s.resolution === '480p' && s.type === 'video') ||
            extracted.find((s) => s.type === 'video') ||
            extracted[0];

          setSelectedStream(preferred);
          setPlayerMode(preferred.type === 'video' ? 'direct' : 'acefile');
        } else if (data.streamServers && data.streamServers.length > 0) {
          setActiveServer(data.streamServers[0]);
          setPlayerMode('server');
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
        console.error('Failed to load episode:', err);
      })
      .finally(() => {
        setIsLoadingEp(false);
      });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  // 2. Handle Samehadaku server API selection
  useEffect(() => {
    if (playerMode !== 'server' || !activeServer) return;

    setServerStatus('loading');
    setEmbedSrc(null);
    setEmbedHtml(null);

    apiService
      .getServerEmbed(activeServer.dataPost, activeServer.dataNume, activeServer.dataType || 'schtml')
      .then((res) => {
        if (res.embedUrl) {
          setEmbedSrc(res.embedUrl);
          setServerStatus('ready');
        } else if (res.html && res.html !== '-1') {
          const matchSrc = res.html.match(/src=["'](.*?)["']/i);
          if (matchSrc && matchSrc[1]) {
            setEmbedSrc(matchSrc[1]);
          } else {
            setEmbedHtml(res.html);
          }
          setServerStatus('ready');
        } else {
          // Upstream Samehadaku returned -1 or empty
          setServerStatus('unavailable');
        }
      })
      .catch(() => {
        setServerStatus('unavailable');
      });
  }, [playerMode, activeServer]);

  // Keyboard navigation for Prev/Next & Theater
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

  if (!episode) {
    return (
      <div className="py-20">
        <ErrorState
          title="Gagal Memuat Episode"
          message="Episode ini tidak ditemukan atau server sedang mengalami kendala."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  const parentSlug = episode.parentAnime?.slug || slug?.replace(/-episode-\d+.*$/, '') || '';

  // Get distinct resolutions for the direct video player
  const directVideoQualities = Array.from(
    new Map(
      playableStreams
        .filter((s) => s.type === 'video')
        .map((s) => [s.resolution, s])
    ).values()
  );

  const acefileQualities = Array.from(
    new Map(
      playableStreams
        .filter((s) => s.type === 'iframe')
        .map((s) => [s.resolution, s])
    ).values()
  );

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
        
        {/* Main Video Player Container */}
        <div ref={playerContainerRef} className="space-y-3">
          <div className="relative aspect-video w-full rounded bg-black border border-border overflow-hidden shadow-elevated">
            
            {/* Player View: Direct HTML5 Video */}
            {playerMode === 'direct' && selectedStream && !videoError ? (
              <video
                ref={videoRef}
                key={selectedStream.streamUrl}
                src={selectedStream.streamUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
                onError={() => {
                  console.warn('Video error on stream, falling back to iframe');
                  setVideoError(true);
                  if (acefileQualities.length > 0) {
                    setPlayerMode('acefile');
                    setSelectedStream(acefileQualities[0]);
                  }
                }}
              >
                Browser Anda tidak mendukung pemutar video HTML5.
              </video>
            ) : playerMode === 'acefile' && selectedStream ? (
              /* Player View: Acefile Embed Iframe */
              <iframe
                src={selectedStream.streamUrl}
                title={episode.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : playerMode === 'server' ? (
              /* Player View: Samehadaku API Server */
              serverStatus === 'loading' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black/90">
                  <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-xs font-semibold text-neutral-300">
                    Menghubungkan ke {activeServer?.serverName || 'server'}...
                  </p>
                </div>
              ) : serverStatus === 'ready' && embedSrc ? (
                <iframe
                  src={embedSrc}
                  title={episode.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : serverStatus === 'ready' && embedHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: embedHtml }}
                  className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                />
              ) : (
                /* Auto-switch prompt if server returned -1 */
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#111319] to-[#090a0f]">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">
                    Server {activeServer?.serverName} Sedang Mengalami Hambatan
                  </h3>
                  <p className="text-xs text-neutral-400 max-w-md mb-5 leading-relaxed">
                    Server Samehadaku ini sedang membatasi pemutaran lintas domain. Klik tombol di bawah untuk langsung menonton menggunakan <strong>iWatch Direct Player HD</strong>.
                  </p>
                  <button
                    onClick={() => {
                      setPlayerMode('direct');
                      if (directVideoQualities.length > 0) {
                        setSelectedStream(directVideoQualities[0]);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-card"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Putar Sekarang (iWatch Direct Player HD)</span>
                  </button>
                </div>
              )
            ) : (
              /* Fallback if everything else is unavailable */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-[#111319] to-[#090a0f]">
                <MonitorPlay className="w-10 h-10 text-primary mb-3" />
                <h3 className="text-base font-bold text-white mb-2">
                  Pilih Sumber Pemutar Video
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mb-4">
                  Pilih salah satu server pemutar di bawah untuk mulai memutar video secara instan.
                </p>
                {directVideoQualities.length > 0 && (
                  <button
                    onClick={() => {
                      setPlayerMode('direct');
                      setSelectedStream(directVideoQualities[0]);
                    }}
                    className="px-4 py-2 rounded bg-primary text-white text-xs font-bold"
                  >
                    Putar via Direct Player
                  </button>
                )}
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

        {/* Server & Quality Switcher Console */}
        <div className="p-4 rounded bg-background-surface border border-border-subtle space-y-4">
          
          {/* Main Engine Mode Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Server className="w-4 h-4 text-primary" />
                <span>Pilih Mesin Pemutar:</span>
              </span>
              <span className="text-[11px] text-neutral-500 hidden sm:inline">
                Pilih mesin pemutar jika satu server bermasalah
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Direct Player (HTML5 Native) */}
              {directVideoQualities.length > 0 && (
                <button
                  onClick={() => {
                    setPlayerMode('direct');
                    setVideoError(false);
                    if (!selectedStream || selectedStream.type !== 'video') {
                      setSelectedStream(directVideoQualities[0]);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all ${
                    playerMode === 'direct'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-background-subtle border-border-subtle text-neutral-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>⚡ iWatch Direct Player HD (Rekomendasi)</span>
                </button>
              )}

              {/* Acefile Player */}
              {acefileQualities.length > 0 && (
                <button
                  onClick={() => {
                    setPlayerMode('acefile');
                    if (!selectedStream || selectedStream.type !== 'iframe') {
                      setSelectedStream(acefileQualities[0]);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all ${
                    playerMode === 'acefile'
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-background-subtle border-border-subtle text-neutral-400 hover:text-white'
                  }`}
                >
                  <Film className="w-3.5 h-3.5" />
                  <span>Acefile Embed Player</span>
                </button>
              )}
            </div>
          </div>

          {/* Quality Selector (when Direct Player or Acefile Player is active) */}
          {playerMode === 'direct' && directVideoQualities.length > 0 && (
            <div className="pt-2 border-t border-border-subtle/60 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-400 mr-2">
                Pilih Kualitas Video:
              </span>
              {directVideoQualities.map((item) => {
                const isSelected = selectedStream?.streamUrl === item.streamUrl;
                return (
                  <button
                    key={item.resolution}
                    onClick={() => {
                      setSelectedStream(item);
                      setVideoError(false);
                    }}
                    className={`px-3 py-1 rounded text-xs font-bold border transition-all ${
                      isSelected
                        ? 'bg-accent-amber/15 text-accent-amber border-accent-amber'
                        : 'bg-background-elevated border-border-subtle text-neutral-300 hover:text-white'
                    }`}
                  >
                    {item.resolution}
                  </button>
                );
              })}
            </div>
          )}

          {/* Samehadaku Server Selector (Alternative fallback) */}
          {episode.streamServers && episode.streamServers.length > 0 && (
            <div className="pt-2 border-t border-border-subtle/60 space-y-2">
              <span className="text-xs font-semibold text-neutral-400 block">
                Server Asli Samehadaku (Jika Ingin Mencoba Server Web Asli):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {episode.streamServers.map((s) => {
                  const isActive = playerMode === 'server' && activeServer?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => {
                        setPlayerMode('server');
                        setActiveServer(s);
                      }}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium border transition-all ${
                        isActive
                          ? 'bg-primary text-white border-primary shadow-xs'
                          : 'bg-background-subtle border-border-subtle text-neutral-400 hover:text-white hover:border-neutral-600'
                      }`}
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>{s.serverName}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

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
