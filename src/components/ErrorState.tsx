import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kesalahan',
  message = 'Tidak dapat memuat data dari server. Silakan coba kembali beberapa saat lagi.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-background-surface rounded border border-border-subtle max-w-lg mx-auto my-12">
      <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4">
        <AlertCircle className="w-6 h-6" />
      </div>
      <h3 className="text-base sm:text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed max-w-md">
        {message}
      </p>
      <div className="flex items-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        )}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded bg-background-elevated hover:bg-neutral-800 border border-border-subtle text-neutral-300 hover:text-white text-xs font-medium transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Kembali ke Beranda</span>
        </Link>
      </div>
    </div>
  );
};

