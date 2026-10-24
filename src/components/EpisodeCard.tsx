import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Clock } from 'lucide-react';
import { LatestEpisodeItem } from '@/types/anime';
import { extractEpisodeNumber } from '@/services/api';

interface EpisodeCardProps {
  item: LatestEpisodeItem;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ item }) => {
  const epNumber = item.episode || extractEpisodeNumber(item.title) || extractEpisodeNumber(item.animeSlug);

  return (
    <Link
      to={`/nonton/${item.animeSlug}`}
      className="group flex flex-col bg-background-surface rounded border border-border-subtle hover:border-neutral-600 transition-all duration-200 overflow-hidden shadow-subtle hover:shadow-card"
    >
      {/* Thumbnail Container 16:9 */}
      <div className="relative aspect-video w-full overflow-hidden bg-background-subtle">
        <img
          src={item.poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-300 ease-out"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-background-surface/90 via-transparent to-transparent" />

        {/* Episode Badge */}
        {epNumber !== null && (
          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-primary text-white text-[11px] font-bold shadow-md">
            Eps {epNumber}
          </div>
        )}

        {/* Release Date badge */}
        {item.releaseDate && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1 text-[11px] text-neutral-300 font-medium px-1.5 py-0.5 rounded bg-background/80 backdrop-blur-sm border border-border-subtle">
            <Clock className="w-3 h-3 text-neutral-400" />
            <span>{item.releaseDate}</span>
          </div>
        )}

        {/* Center Play Button on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-10 h-10 rounded-full bg-primary/95 text-white flex items-center justify-center shadow-elevated transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      {/* Title & Info */}
      <div className="p-3 flex flex-col justify-between flex-1 gap-1">
        <h4 className="text-xs sm:text-sm font-semibold text-neutral-200 group-hover:text-white line-clamp-1 transition-colors">
          {item.title}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-0.5">
          <span>{item.postedBy ? `Oleh ${item.postedBy}` : 'Sub Indonesia'}</span>
          <span className="text-primary font-medium group-hover:underline">Putar Sekarang</span>
        </div>
      </div>
    </Link>
  );
};

