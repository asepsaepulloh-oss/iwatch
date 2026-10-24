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
  Zap,
  Check,
  Film,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { EpisodeDetail, StreamServer, DownloadFormat } from '@/types/anime';
import { ErrorState } from '@/components/ErrorState';
import { useWatchHistory } from '@/hooks/useStorage';

interface FiledonStream {
  resolution: string;
  embedUrl: string;
  format: string;
}

interface Mp4Stream {
  resolution: string;
  streamUrl: string;
}

export const WatchPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [episode, setEpisode] = useState<EpisodeDetail | null>(null);

  // Active player mode: 'filedon' (Iframe Filedon), 'direct' (HTML5 Video), 'api' (Samehadaku /api/server)
  const [playerMode, setPlayerMode] = useState<'filedon' | 'direct' | 'api'>('filedon');

  // Filedon stream options (extracted from episode data)
  const [filedonStreams, setFiledonStreams] = useState<FiledonStream[]>([]);
  const [selectedFiledon, setSelectedFiledon] = useState<FiledonStream | null>(null);

  // Direct MP4 streams
  const [mp4Streams, setMp4Streams] = useState<Mp4Stream[]>([]);
  const [selectedMp4, setSelectedMp4] = useState<Mp4Stream | null>(null);

  // Samehadaku API server state
  const [activeApiServer, setActiveApiServer] = useState<StreamServer | null>(null);
  const [apiEmbedSrc, setApiEmbedSrc] = useState<string | null>(null);
  const [apiEmbedHtml, setApiEmbedHtml] = useState<string | null>(null);
  const [isLoadingApiServer, setIsLoadingApiServer] = useState<boolean>(false);

  const [isLoadingEp, setIsLoadingEp] = useState<boolean>(true);
  const [activeFormatTab, setActiveFormatTab] = useState<string>('MKV');
  const [theaterMode, setTheaterMode] = useState<boolean>(false);

  const { saveProgress } = useWatchHistory();
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // 1. Fetch episode data
  useEffect(() => {
    if (!slug) return;
    setIsLoadingEp(true);
    setApiEmbedSrc(null);
    setApiEmbedHtml(null);

    apiService
      .getEpisodeDetail(slug)
      .then((data) => {
        setEpisode(data);

        // A. Extract Filedon streams (prefer MP4 format)
        const filedonList: FiledonStream[] = [];
        const mp4List: Mp4Stream[] = [];

        for (const fmt of data.downloads || []) {
          for (const res of fmt.resolutions || []) {
            for (const link of res.links || []) {
              // 1. Check Filedon
              if (link.server.toLowerCase().includes('filedon')) {
                const match = link.url.match(/filedon\.co\/(?:view|embed)\/([a-zA-Z0-9_-]+)/);
                if (match && match[1]) {
                  filedonList.push({
                    resolution: res.resolution,
                    embedUrl: `https://filedon.co/embed/${match[1]}`,
                    format: fmt.format,
                  });
                }
              }

              // 2. Check Pixeldrain MP4
              if (fmt.format.toUpperCase().includes('MP4')) {
                const pixelMatch = link.url.match(/pixeldrain\.com\/u\/([a-zA-Z0-9_-]+)/);
                if (pixelMatch && pixelMatch[1]) {
                  mp4List.push({
                    resolution: res.resolution,
                    streamUrl: `https://pixeldrain.com/api/file/${pixelMatch[1]}`,
                  });
                }
              }
            }
          }
        }

        // Sort Filedon to have MP4 first, and distinct resolutions
        const distinctFiledon = Array.from(
          new Map(
            filedonList
              .sort((a, b) => (a.format.includes('MP4') ? -1 : 1))
              .map((item) => [item.resolution, item])
          ).values()
        );

        setFiledonStreams(distinctFiledon);
        setMp4Streams(mp4List);

        // Set default stream: prefer 720p/MP4HD on Filedon, or 1080p, or first available
        if (distinctFiledon.length > 0) {
          const pref =
            distinctFiledon.find((f) => f.resolution === 'MP4HD' || f.resolution === '720p') ||
            distinctFiledon.find((f) => f.resolution === 'FULLHD' || f.resolution === '1080p') ||
            distinctFiledon[0];

          setSelectedFiledon(pref);
          setPlayerMode('filedon');
        } else if (mp4List.length > 0) {
          setSelectedMp4(mp4List[0]);
          setPlayerMode('direct');
        } else if (data.streamServers && data.streamServers.length > 0) {
          setActiveApiServer(data.streamServers[0]);
          setPlayerMode('api');
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

  // 2. Fetch server embed from Samehadaku API if 'api' mode is chosen
  useEffect(() => {
    if (playerMode !== 'api' || !activeApiServer) return;

    setIsLoadingApiServer(true);
    setApiEmbedSrc(null);
    setApiEmbedHtml(null);

    apiService
      .getServerEmbed(activeApiServer.dataPost, activeApiServer.dataNume, activeApiServer.dataType || 'schtml')
      .then((res) => {
        if (res.embedUrl) {
          setApiEmbedSrc(res.embedUrl);
        } else if (res.html && res.html !== '-1') {
          const matchSrc = res.html.match(/src=["'](.*?)["']/i);
          if (matchSrc && matchSrc[1]) {
            setApiEmbedSrc(matchSrc[1]);
          } else {
            setApiEmbedHtml(res.html);
          }
        } else {
          // If Samehadaku AJAX returns -1, automatically switch to Filedon
          if (filedonStreams.length > 0) {
            setPlayerMode('filedon');
          }
        }
      })
      .catch(() => {
        if (filedonStreams.length > 0) {
          setPlayerMode('filedon');
        }
      })
      .finally(() => {
        setIsLoadingApiServer(false);
      });
  }, [playerMode, activeApiServer, filedonStreams]);

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
            
            {/* Loading Indicator for Samehadaku API Server */}
            {isLoadingApiServer && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/85 backdrop-blur-xs">
                <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-neutral-300">
                  Menghubungkan ke server {activeApiServer?.serverName}...
                </p>
              </div>
            )}

            {/* View 1: Filedon Embed Player (Default, Terbukti Lancar) */}
            {playerMode === 'filedon' && selectedFiledon ? (
              <iframe
                key={selectedFiledon.embedUrl}
                src={selectedFiledon.embedUrl}
                title={episode.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : playerMode === 'direct' && selectedMp4 ? (
              /* View 2: Direct MP4 Video Player */
              <video
                ref={videoRef}
                key={selectedMp4.streamUrl}
                src={selectedMp4.streamUrl}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              >
                Browser Anda tidak mendukung pemutar video HTML5.
              </video>
            ) : playerMode === 'api' ? (
              /* View 3: Samehadaku API Iframe */
              apiEmbedSrc ? (
                <iframe
                  src={apiEmbedSrc}
                  title={episode.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : apiEmbedHtml ? (
                <div
                  dangerouslySetInnerHTML={{ __html: apiEmbedHtml }}
                  className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
                />
              ) : selectedFiledon ? (
                <iframe
                  src={selectedFiledon.embedUrl}
                  title={episode.title}
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              ) : null
            ) : null}
          </div>

          {/* Quick Player Bar: Prev / Next / Theater */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded bg-background-surface border border-border-subtle text-xs">
            {/* Prev / Next Episode Buttons */}
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

            {/* Quality Selector Pills (for Filedon) */}
            {playerMode === 'filedon' && filedonStreams.length > 0 && (
              <div className="flex items-center gap-1 bg-background-elevated p-1 rounded border border-border-subtle">
                <span className="text-[11px] text-neutral-400 px-2 font-medium">Kualitas:</span>
                {filedonStreams.map((q) => {
                  const isSelected = selectedFiledon?.resolution === q.resolution;
                  return (
                    <button
                      key={q.resolution}
                      onClick={() => setSelectedFiledon(q)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-xs'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {q.resolution}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Theater Mode Toggle */}
            <div className="flex items-center gap-3">
              {parentSlug && (
                <Link
                  to={`/anime/${parentSlug}`}
                  className="flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Semua Episode</span>
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

        {/* Streaming Servers Selector Console */}
        <div className="p-4 rounded bg-background-surface border border-border-subtle space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-4 h-4 text-primary" />
              <span>Pilihan Server Streaming:</span>
            </span>
            <span className="text-[11px] text-neutral-500 hidden sm:inline">
              Pilih server jika video macet atau lambat
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* Server Filedon (Recommended) */}
            {filedonStreams.length > 0 && (
              <button
                onClick={() => setPlayerMode('filedon')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all ${
                  playerMode === 'filedon'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-background-subtle border-border-subtle text-neutral-400 hover:text-white'
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>⚡ Server Filedon HD (Aktif)</span>
              </button>
            )}

            {/* Direct MP4 Player */}
            {mp4Streams.length > 0 && (
              <button
                onClick={() => setPlayerMode('direct')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition-all ${
                  playerMode === 'direct'
                    ? 'bg-primary text-white border-primary shadow-xs'
                    : 'bg-background-subtle border-border-subtle text-neutral-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Direct Stream MP4</span>
              </button>
            )}

            {/* Samehadaku Official API Servers */}
            {episode.streamServers?.map((s) => {
              const isActive = playerMode === 'api' && activeApiServer?.id === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveApiServer(s);
                    setPlayerMode('api');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all ${
                    isActive
                      ? 'bg-primary text-white border-primary shadow-xs font-semibold'
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
