import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Filter,
  Layers,
  SlidersHorizontal,
  Search,
  Tag,
  X,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { AnimeCatalogItem, GenreItem, Pagination as PaginationType } from '@/types/anime';
import { AnimeCard } from '@/components/AnimeCard';
import { Pagination } from '@/components/Pagination';
import { GridSkeleton } from '@/components/LoadingSkeleton';
import { ErrorState } from '@/components/ErrorState';

export const CatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchQuery = searchParams.get('search') || '';
  const selectedGenre = searchParams.get('genre') || '';
  const selectedStatus = searchParams.get('status') || 'all';
  const selectedOrder = searchParams.get('order') || 'popular';
  const currentPage = parseInt(searchParams.get('page') || '1', 10);

  const [animeList, setAnimeList] = useState<AnimeCatalogItem[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [pagination, setPagination] = useState<PaginationType>({
    currentPage: 1,
    totalPages: null,
    hasNextPage: false,
    hasPrevPage: false,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load genres once
  useEffect(() => {
    apiService
      .getGenres()
      .then((res) => setGenres(res.data || []))
      .catch((err) => console.warn('Failed to load genres:', err));
  }, []);

  // Fetch catalog based on current filters
  useEffect(() => {
    const fetchCatalog = async () => {
      setIsLoading(true);
      setError(null);
      try {
        if (searchQuery.trim()) {
          // Search mode
          const res = await apiService.searchAnime(searchQuery.trim());
          const mapped: AnimeCatalogItem[] = (res.data || []).map((s) => ({
            title: s.title,
            slug: s.slug,
            url: s.url,
            poster: s.poster,
            score: s.score,
            type: s.type,
            genres: s.genres,
          }));
          setAnimeList(mapped);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            totalItems: mapped.length,
          });
        } else if (selectedGenre) {
          // Genre mode
          const res = await apiService.getAnimeByGenre(selectedGenre, currentPage);
          setAnimeList(res.data || []);
          setPagination(res.pagination || {
            currentPage,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
            totalItems: (res.data || []).length,
          });
        } else {
          // Standard catalog with status & order filter
          const res = await apiService.getCatalog(
            currentPage,
            selectedStatus === 'all' ? undefined : selectedStatus,
            selectedOrder === 'default' ? undefined : selectedOrder
          );
          setAnimeList(res.data || []);
          setPagination(res.pagination || {
            currentPage,
            totalPages: null,
            hasNextPage: false,
            hasPrevPage: false,
            totalItems: (res.data || []).length,
          });
        }
      } catch (err: any) {
        setError(err.message || 'Gagal memuat katalog anime.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery, selectedGenre, selectedStatus, selectedOrder, currentPage]);

  const updateParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === 'all' || value === 'default') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    // Reset to page 1 on filter changes
    if (key !== 'page') newParams.delete('page');
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Breadcrumb */}
      <div className="space-y-2 border-b border-border-subtle pb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-primary rounded-xs" />
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Katalog Anime
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-neutral-400">
          Jelajahi seluruh koleksi anime terlengkap dengan filter status, urutan populer, dan kategori genre.
        </p>
      </div>

      {/* Active Search Notice if Searching */}
      {searchQuery && (
        <div className="flex items-center justify-between p-3.5 rounded bg-background-surface border border-border-subtle text-xs text-neutral-300">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <span>
              Menampilkan hasil pencarian untuk: <strong className="text-white font-semibold">"{searchQuery}"</strong>
            </span>
          </div>
          <button
            onClick={() => updateParam('search', '')}
            className="text-neutral-400 hover:text-white flex items-center gap-1 font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Hapus Pencarian</span>
          </button>
        </div>
      )}

      {/* Filter Control Bar */}
      <div className="bg-background-surface p-4 rounded border border-border-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <div className="flex items-center gap-1.5 bg-background-subtle p-1 rounded border border-border-subtle text-xs">
              <span className="text-neutral-400 px-2 font-medium">Status:</span>
              {[
                { id: 'all', label: 'Semua' },
                { id: 'ongoing', label: 'Ongoing' },
                { id: 'completed', label: 'Tamat' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => updateParam('status', s.id)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    selectedStatus === s.id
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Order Filter */}
            <div className="flex items-center gap-1.5 bg-background-subtle p-1 rounded border border-border-subtle text-xs">
              <span className="text-neutral-400 px-2 font-medium">Urutan:</span>
              {[
                { id: 'popular', label: 'Populer' },
                { id: 'latest', label: 'Terbaru' },
                { id: 'title', label: 'Judul (A-Z)' },
              ].map((o) => (
                <button
                  key={o.id}
                  onClick={() => updateParam('order', o.id)}
                  className={`px-2.5 py-1 rounded font-medium transition-colors ${
                    selectedOrder === o.id
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {(selectedGenre || selectedStatus !== 'all' || selectedOrder !== 'popular' || searchQuery) && (
            <button
              onClick={clearAllFilters}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        {/* Genre Chips */}
        {genres.length > 0 && (
          <div className="pt-2 border-t border-border-subtle/60">
            <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-neutral-400">
              <Tag className="w-3.5 h-3.5 text-primary" />
              <span>Pilih Genre:</span>
              {selectedGenre && (
                <span className="text-primary font-bold uppercase text-[11px]">
                  ({selectedGenre})
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
              <button
                onClick={() => updateParam('genre', '')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                  !selectedGenre
                    ? 'bg-primary text-white border-primary font-semibold'
                    : 'bg-background-subtle text-neutral-400 border-border-subtle hover:text-white hover:border-neutral-600'
                }`}
              >
                Semua Genre
              </button>
              {genres.map((g) => (
                <button
                  key={g.slug}
                  onClick={() => updateParam('genre', g.slug === selectedGenre ? '' : g.slug)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium border transition-colors ${
                    selectedGenre === g.slug
                      ? 'bg-primary text-white border-primary font-semibold'
                      : 'bg-background-subtle text-neutral-400 border-border-subtle hover:text-white hover:border-neutral-600'
                  }`}
                >
                  {g.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      {isLoading ? (
        <GridSkeleton count={18} aspect="poster" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => updateParam('page', '1')} />
      ) : animeList.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {animeList.map((item) => (
              <AnimeCard key={item.slug} item={item} />
            ))}
          </div>

          {/* Pagination */}
          {!searchQuery && (
            <Pagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
              onPageChange={(p) => updateParam('page', p.toString())}
            />
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-background-surface rounded border border-border-subtle">
          <p className="text-neutral-400 text-sm mb-4">
            Tidak ada anime yang cocok dengan kriteria filter saat ini.
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 rounded bg-primary text-white text-xs font-semibold hover:bg-primary-hover transition-colors"
          >
            Reset Filter
          </button>
        </div>
      )}
    </div>
  );
};

