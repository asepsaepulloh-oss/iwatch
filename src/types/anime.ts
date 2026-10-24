export interface ApiResponse<T> {
  status: 'success' | 'error';
  statusCode: number;
  message?: string;
  cached?: boolean;
  data: T;
  meta?: any;
}

export interface Pagination {
  currentPage: number;
  totalPages: number | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalItems: number;
}

export interface PaginatedData<T> {
  currentPage: number;
  pagination: Pagination;
  totalItems: number;
  data: T[];
}

export interface LatestEpisodeItem {
  title: string;
  animeSlug: string; // This is the episode slug (e.g. "shuiro-no-kamen-episode-3")
  url: string;
  episode: string | number | null;
  poster: string;
  postedBy?: string;
  releaseDate?: string;
}

export interface AnimeCatalogItem {
  title: string;
  slug: string;
  url: string;
  poster: string;
  score?: string | null;
  type?: string | null;
  status?: string | null;
  genres?: string[] | string;
}

export interface TopAnimeItem {
  rank: number;
  title: string;
  slug: string;
  url: string;
  poster: string;
  score?: string | null;
  postedBy?: string;
  releasedOn?: string;
  genres?: string[] | string;
}

export interface EpisodeSummary {
  title: string;
  slug: string;
  episodeNumber?: string | number;
  releaseDate?: string;
}

export interface AnimeDetail {
  title: string;
  slug?: string;
  japaneseTitle?: string;
  synopsis?: string;
  poster: string;
  score?: string;
  status?: string;
  type?: string;
  totalEpisodes?: string | number;
  duration?: string;
  releaseDate?: string;
  studio?: string;
  genres: Array<{ name: string; slug: string }> | string[];
  episodeList: EpisodeSummary[];
}

export interface StreamServer {
  id: number | string;
  serverName: string;
  dataPost: string;
  dataNume: string;
  dataType?: string;
}

export interface DownloadLink {
  server: string;
  url: string;
}

export interface DownloadResolution {
  resolution: string;
  links: DownloadLink[];
}

export interface DownloadFormat {
  format: string;
  resolutions: DownloadResolution[];
}

export interface EpisodeDetail {
  title: string;
  slug: string;
  url: string;
  parentAnime?: {
    title: string;
    slug: string;
    url?: string;
  };
  navigation?: {
    prevEpisodeSlug: string | null;
    nextEpisodeSlug: string | null;
  };
  streamServers: StreamServer[];
  downloads?: DownloadFormat[];
}

export interface ServerEmbedResponse {
  post: string;
  nume: string;
  type?: string;
  embedUrl: string | null;
  html: string | null;
}

export interface ScheduleItem {
  title: string;
  slug: string;
  url: string;
  poster?: string;
  score?: string;
  genres?: string[] | string;
  releaseTime?: string;
  episode?: string;
}

export interface ScheduleDay {
  day: string;
  label: string;
  totalItems: number;
  data: ScheduleItem[];
}

export interface ScheduleData {
  totalAnimes: number;
  availableDays: Array<{ day: string; label: string }>;
  schedule: Record<string, ScheduleDay>;
}

export interface GenreItem {
  name: string;
  slug: string;
  url?: string;
}

export interface SearchResultItem {
  title: string;
  slug: string;
  url: string;
  poster: string;
  score?: string;
  type?: string;
  genres?: string[] | string;
  releaseDate?: string;
}

export interface WatchHistoryItem {
  animeSlug: string;
  episodeSlug: string;
  animeTitle: string;
  episodeTitle: string;
  poster: string;
  episodeNumber?: string | number;
  timestamp: number; // seconds
  duration?: number; // total duration
  watchedAt: number; // unix timestamp in ms
}

export interface BookmarkItem {
  animeSlug: string;
  title: string;
  poster: string;
  score?: string | null;
  status?: string | null;
  addedAt: number;
}

