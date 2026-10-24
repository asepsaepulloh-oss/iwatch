import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, Star, ChevronLeft, ChevronRight, Flame } from 'lucide-react';
import { TopAnimeItem } from '@/types/anime';

interface HeroBannerProps {
  items: TopAnimeItem[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const featured = items.slice(0, 5);

  useEffect(() => {
    if (featured.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (featured.length === 0) return null;
  const current = featured[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + featured.length) % featured.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % featured.length);
  };

  return (
    <div className="relative w-full h-[380px] sm:h-[440px] md:h-[500px] overflow-hidden bg-background border-b border-border-subtle">
      {/* Background Poster Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={current.poster}
          alt={current.title}
          className="w-full h-full object-cover object-top opacity-35 filter blur-xs scale-105 transition-all duration-700 ease-out"
        />
        {/* Editorial Gradients: Left to dark, Bottom to dark */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0f] via-[#090a0f]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-[#090a0f]/40 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          
          {/* Spotlight Tag */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-primary text-white text-xs font-bold tracking-wide uppercase shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-white" />
              Peringkat #{currentIndex + 1} Terpopuler
            </span>
            {current.score && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-background-surface/80 border border-border-subtle text-accent-amber text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-accent-amber" />
                {current.score.replace(/[^0-9.]/g, '')}
              </span>
            )}
            {current.releasedOn && (
              <span className="text-xs text-neutral-400 font-medium">
                {current.releasedOn}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight line-clamp-2">
            {current.title}
          </h1>

          {/* Description placeholder / Subtitle */}
          <p className="text-xs sm:text-sm text-neutral-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
            Tonton episode terbaru dari seri terpopuler minggu ini dalam kualitas tinggi dengan terjemahan subtitle bahasa Indonesia yang rapi dan terverifikasi.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              to={`/anime/${current.slug}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary hover:bg-primary-hover text-white font-semibold text-sm transition-colors shadow-card"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Mulai Nonton</span>
            </Link>

            <Link
              to={`/anime/${current.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-background-elevated hover:bg-neutral-800 border border-border text-neutral-200 hover:text-white font-medium text-sm transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Detail Lengkap</span>
            </Link>
          </div>
        </div>

        {/* Carousel Slide Indicators & Arrows */}
        <div className="absolute right-4 sm:right-8 bottom-6 flex items-center gap-3">
          <div className="flex items-center gap-1.5 mr-2">
            {featured.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-neutral-600 hover:bg-neutral-400'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={handlePrev}
            className="p-2 rounded bg-background-surface/80 hover:bg-background-elevated border border-border-subtle text-neutral-300 hover:text-white transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded bg-background-surface/80 hover:bg-background-elevated border border-border-subtle text-neutral-300 hover:text-white transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

