import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Search,
  Clock,
  Flame,
  Calendar,
  Compass,
  Menu,
  X,
  Play,
  Star,
  ChevronRight,
  Bookmark,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { SearchResultItem } from '@/types/anime';

export const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debounced search logic
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await apiService.searchAnime(query);
        setResults(res.data?.slice(0, 6) || []);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle click outside to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    navigate(`/katalog?search=${encodeURIComponent(query.trim())}`);
  };

  const navLinks = [
    { to: '/', label: 'Beranda' },
    { to: '/katalog', label: 'Katalog', icon: Compass },
    { to: '/jadwal', label: 'Jadwal Rilis', icon: Calendar },
    { to: '/top-10', label: 'Top 10', icon: Flame },
    { to: '/riwayat', label: 'Riwayat', icon: Clock },
    { to: '/koleksi', label: 'Koleksi', icon: Bookmark },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#090a0f]/95 backdrop-blur-md border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 group select-none">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center font-black text-white text-lg tracking-wider transition-transform group-hover:scale-105 shadow-sm">
                <Play className="w-4 h-4 fill-white text-white ml-0.5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                i<span className="text-primary">Watch</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                      isActive
                        ? 'text-white bg-background-elevated border border-border-subtle'
                        : 'text-neutral-400 hover:text-white hover:bg-background-subtle'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Search Bar & Mobile Toggle */}
          <div className="flex items-center gap-3 flex-1 max-w-md justify-end">
            <div ref={searchRef} className="relative w-full max-w-xs sm:max-w-sm">
              <form onSubmit={handleSearchSubmit} className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => query.trim() && setIsOpen(true)}
                  placeholder="Cari anime atau episode..."
                  className="w-full bg-background-surface text-sm text-neutral-100 placeholder-neutral-500 rounded pl-9 pr-4 py-1.5 border border-border-subtle focus:border-neutral-500 focus:outline-none transition-all"
                />
                <Search className="w-4 h-4 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </form>

              {/* Instant Search Dropdown */}
              {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-full min-w-[320px] max-w-sm bg-background-surface border border-border rounded shadow-elevated overflow-hidden z-50 animate-fade-in">
                  <div className="p-2 border-b border-border-subtle text-xs font-medium text-neutral-400 flex items-center justify-between">
                    <span>Hasil Pencarian</span>
                    <span className="text-[11px] text-neutral-500">{results.length} ditemukan</span>
                  </div>

                  {results.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto divide-y divide-border-subtle/40">
                      {results.map((item) => {
                        const isEpisode = item.slug.includes('-episode-') || item.type?.toLowerCase().includes('eps');
                        const targetUrl = isEpisode ? `/nonton/${item.slug}` : `/anime/${item.slug}`;

                        return (
                          <Link
                            key={item.slug}
                            to={targetUrl}
                            onClick={() => {
                              setIsOpen(false);
                              setQuery('');
                            }}
                            className="flex items-center gap-3 p-2.5 hover:bg-background-elevated transition-colors group"
                          >
                            <img
                              src={item.poster}
                              alt={item.title}
                              className="w-10 h-14 object-cover rounded bg-background-subtle flex-shrink-0"
                              loading="lazy"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-neutral-200 group-hover:text-white line-clamp-1">
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                {item.score && (
                                  <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-amber font-medium">
                                    <Star className="w-2.5 h-2.5 fill-current" />
                                    {item.score.replace(/[^0-9.]/g, '')}
                                  </span>
                                )}
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-background-subtle text-neutral-400 border border-border-subtle">
                                  {item.type || 'Anime'}
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-neutral-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        );
                      })}
                      <div className="p-2 bg-background-subtle/50 text-center">
                        <button
                          onClick={handleSearchSubmit}
                          className="text-xs text-primary font-medium hover:underline inline-flex items-center gap-1"
                        >
                          Lihat semua hasil untuk "{query}"
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 text-center text-xs text-neutral-400">
                      Tidak ada hasil untuk "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded text-neutral-400 hover:text-white hover:bg-background-subtle focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border-subtle bg-background-surface px-4 pt-3 pb-5 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium ${
                    isActive
                      ? 'text-white bg-primary font-semibold'
                      : 'text-neutral-300 hover:text-white hover:bg-background-elevated'
                  }`
                }
              >
                {Icon && <Icon className="w-4 h-4 text-neutral-400" />}
                {link.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
};

