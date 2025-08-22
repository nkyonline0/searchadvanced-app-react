export type TmdbMovie = {
  id: number;
  title: string;
  name?: string;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  vote_average: number;
  popularity: number;
  original_language: string;
};

export type TmdbPaginatedResponse<T> = {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
};

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

function getApiKey(): string {
  const key = process.env.TMDB_API_KEY;
  if (!key) {
    throw new Error("TMDB_API_KEY is not set. Add it to your .env.local file.");
  }
  return key;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(`${TMDB_BASE_URL}${path}`);
  url.searchParams.set("api_key", getApiKey());
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null && v !== "") {
        url.searchParams.set(k, String(v));
      }
    }
  }
  return url.toString();
}

export async function tmdbFetch<T>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
  const url = buildUrl(path, params);
  const res = await fetch(url, { next: { revalidate: 60 } });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMDb request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function searchMovies(query: string, page: number, language?: string, includeAdult?: boolean) {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/search/movie", {
    query,
    page,
    language: language || "en-US",
    include_adult: includeAdult ?? false,
  });
}

export async function discoverMovies(params: {
  page?: number;
  language?: string;
  with_genres?: string;
  primary_release_year?: string | number;
  "vote_average.gte"?: string | number;
  sort_by?: string;
}) {
  return tmdbFetch<TmdbPaginatedResponse<TmdbMovie>>("/discover/movie", {
    page: params.page ?? 1,
    language: params.language || "en-US",
    with_genres: params.with_genres,
    primary_release_year: params.primary_release_year,
    "vote_average.gte": params["vote_average.gte"],
    sort_by: params.sort_by || "popularity.desc",
  });
}

export async function getGenres(language?: string) {
  return tmdbFetch<{ genres: { id: number; name: string }[] }>("/genre/movie/list", {
    language: language || "en-US",
  });
}

export function getPosterUrl(path: string | null, size: "w92" | "w154" | "w185" | "w342" | "w500" | "w780" | "original" = "w500") {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/${size}${path}`;
}