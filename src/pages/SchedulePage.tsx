import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Star, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { ScheduleData, ScheduleItem } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import { GridSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';

const DAYS_MAP: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export const SchedulePage: React.FC = () => {
  const [scheduleData, setScheduleData] = useState<ScheduleData | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    const todayIndex = new Date().getDay();
    return DAYS_MAP[todayIndex] || 'monday';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.getSchedule();
      setScheduleData(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat jadwal rilis anime.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const daysList = scheduleData?.availableDays || [
    { day: 'monday', label: 'Senin' },
    { day: 'tuesday', label: 'Selasa' },
    { day: 'wednesday', label: 'Rabu' },
    { day: 'thursday', label: 'Kamis' },
    { day: 'friday', label: 'Jumat' },
    { day: 'saturday', label: 'Sabtu' },
    { day: 'sunday', label: 'Minggu' },
  ];

  const currentDayData = scheduleData?.schedule?.[selectedDay]?.data || [];
  const todayKey = DAYS_MAP[new Date().getDay()];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-xs" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <span>Jadwal Rilis Anime</span>
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400">
          Ketahui hari rilis anime favoritmu setiap minggunya, mulai dari Senin hingga Minggu dengan update tepat waktu.
        </p>
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {daysList.map((d) => {
          const isSelected = selectedDay === d.day;
          const isToday = todayKey === d.day;
          const dayItemsCount = scheduleData?.schedule?.[d.day]?.data?.length || 0;

          return (
            <button
              key={d.day}
              onClick={() => setSelectedDay(d.day)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded text-xs font-semibold whitespace-nowrap transition-all border ${
                isSelected
                  ? 'bg-primary text-white border-primary shadow-card'
                  : 'bg-background-surface text-neutral-400 border-border-subtle hover:text-white hover:bg-background-elevated'
              }`}
            >
              <span>{d.label}</span>
              {isToday && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-primary/20 text-primary'
                }`}>
                  Hari Ini
                </span>
              )}
              {dayItemsCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-background-subtle text-neutral-400'
                }`}>
                  {dayItemsCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Anime Items Grid */}
      {isLoading ? (
        <GridSkeleton count={12} aspect="poster" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadSchedule} />
      ) : currentDayData.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-neutral-400 pb-2">
            <span>
              Menampilkan <strong className="text-white">{currentDayData.length}</strong> judul anime rilis setiap hari{' '}
              <strong className="text-primary capitalize">
                {daysList.find((d) => d.day === selectedDay)?.label}
              </strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {currentDayData.map((item) => (
              <AnimeCard
                key={item.slug}
                item={{
                  title: item.title,
                  slug: item.slug,
                  url: item.url,
                  poster: item.poster || '',
                  score: item.score || null,
                  type: item.releaseTime ? `Rilis ${item.releaseTime}` : 'TV',
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-background-surface rounded border border-border-subtle">
          <Calendar className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-neutral-300">
            Tidak ada jadwal tayang pada hari ini
          </h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Jadwal untuk hari ini sedang diperbarui atau belum ada jadwal episode baru yang terdaftar.
          </p>
        </div>
      )}
    </div>
  );
};

