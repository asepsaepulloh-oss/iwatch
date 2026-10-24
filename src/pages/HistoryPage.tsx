import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Play, Trash2, ArrowRight } from 'lucide-react';
import { useWatchHistory } from '@/hooks/useStorage';

export const HistoryPage: React.FC = () => {
  const { history, removeFromHistory, clearHistory } = useWatchHistory();

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} hari yang lalu`;
    if (hours > 0) return `${hours} jam yang lalu`;
    if (minutes > 0) return `${minutes} menit yang lalu`;
    return 'Baru saja';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-4 bg-primary rounded-xs" />
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary" />
              <span>Riwayat Tontonan</span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400">
            Daftar episode anime yang baru saja kamu tonton di iWatch. Data tersimpan secara lokal di browser kamu.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (confirm('Yakin ingin menghapus seluruh riwayat tontonan?')) {
                clearHistory();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-background-surface hover:bg-neutral-800 border border-border-subtle text-xs text-neutral-400 hover:text-primary transition-colors self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Riwayat</span>
          </button>
        )}
      </div>

      {/* History Items Grid */}
      {history.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((item) => (
            <div
              key={item.episodeSlug}
              className="group relative flex flex-col bg-background-surface rounded border border-border-subtle hover:border-neutral-600 transition-all duration-200 overflow-hidden shadow-subtle hover:shadow-card"
            >
              {/* Thumbnail / Header */}
              <div className="relative aspect-video w-full overflow-hidden bg-background-subtle">
                {item.poster ? (
                  <img
                    src={item.poster}
                    alt={item.episodeTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-background-elevated text-neutral-600">
                    <Play className="w-8 h-8" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background-surface/90 via-transparent to-transparent" />

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromHistory(item.episodeSlug);
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded bg-background/80 hover:bg-primary border border-border-subtle text-neutral-400 hover:text-white transition-colors z-20"
                  title="Hapus item ini"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Watched time badge */}
                <span className="absolute bottom-2 left-2 text-[10px] text-neutral-300 px-2 py-0.5 rounded bg-background/80 backdrop-blur-sm border border-border-subtle font-medium">
                  {formatTime(item.watchedAt)}
                </span>
              </div>

              {/* Info & Link */}
              <div className="p-3.5 flex flex-col justify-between flex-1 gap-3">
                <div>
                  <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider line-clamp-1">
                    {item.animeTitle}
                  </h4>
                  <h3 className="text-sm font-semibold text-neutral-100 group-hover:text-white line-clamp-1 mt-0.5">
                    {item.episodeTitle}
                  </h3>
                </div>

                <Link
                  to={`/nonton/${item.episodeSlug}`}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Lanjutkan Nonton</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-background-surface rounded border border-border-subtle space-y-4">
          <Clock className="w-10 h-10 text-neutral-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-neutral-200">
              Belum ada riwayat tontonan
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              Anime dan episode yang kamu putar akan otomatis tersimpan di sini agar mudah kamu lanjutkan kapan saja.
            </p>
          </div>
          <div>
            <Link
              to="/katalog"
              className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-colors"
            >
              <span>Mulai Menjelajah Anime</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

