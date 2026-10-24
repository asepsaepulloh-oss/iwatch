import React from 'react';

export const GridSkeleton: React.FC<{ count?: number; aspect?: 'poster' | 'landscape' }> = ({
  count = 12,
  aspect = 'poster',
}) => {
  return (
    <div
      className={`grid gap-4 ${
        aspect === 'poster'
          ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6'
          : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
      }`}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col bg-background-surface rounded border border-border-subtle overflow-hidden animate-pulse"
        >
          <div
            className={`w-full bg-background-subtle ${
              aspect === 'poster' ? 'aspect-[3/4]' : 'aspect-video'
            }`}
          />
          <div className="p-3 space-y-2">
            <div className="h-3.5 bg-background-subtle rounded w-4/5" />
            <div className="h-2.5 bg-background-subtle rounded w-2/5" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <div className="w-full h-[380px] sm:h-[440px] md:h-[500px] bg-background-surface border-b border-border-subtle animate-pulse relative">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16 space-y-4">
        <div className="h-5 bg-background-subtle rounded w-36" />
        <div className="h-10 bg-background-subtle rounded w-3/4 max-w-xl" />
        <div className="h-4 bg-background-subtle rounded w-2/3 max-w-md" />
        <div className="flex gap-3 pt-2">
          <div className="h-10 bg-background-subtle rounded w-32" />
          <div className="h-10 bg-background-subtle rounded w-32" />
        </div>
      </div>
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <div className="aspect-[3/4] bg-background-surface rounded border border-border-subtle" />
        <div className="md:col-span-2 lg:col-span-3 space-y-4">
          <div className="h-8 bg-background-surface rounded w-2/3" />
          <div className="flex gap-2">
            <div className="h-6 bg-background-surface rounded w-16" />
            <div className="h-6 bg-background-surface rounded w-20" />
            <div className="h-6 bg-background-surface rounded w-24" />
          </div>
          <div className="space-y-2 pt-4">
            <div className="h-4 bg-background-surface rounded w-full" />
            <div className="h-4 bg-background-surface rounded w-5/6" />
            <div className="h-4 bg-background-surface rounded w-4/6" />
          </div>
          <div className="pt-6 flex gap-3">
            <div className="h-11 bg-background-surface rounded w-40" />
            <div className="h-11 bg-background-surface rounded w-32" />
          </div>
        </div>
      </div>
    </div>
  );
};

