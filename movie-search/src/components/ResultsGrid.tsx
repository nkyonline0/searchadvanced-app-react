"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import MovieCard from "@/components/MovieCard";
import { TmdbMovie } from "@/lib/tmdb";

export type ResultsGridProps = {
  query: string;
  filters: {
    genres: number[];
    year?: string;
    language?: string;
    ratingGte?: number;
  };
  sortBy: string;
  infinite?: boolean;
};

type PageData = { page: number; results: TmdbMovie[]; total_pages: number };

export default function ResultsGrid({ query, filters, sortBy, infinite }: ResultsGridProps) {
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState<PageData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const loadMoreRef = useRef<HTMLButtonElement>(null);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set("query", query);
    p.set("page", String(page));
    if (filters.language) p.set("language", filters.language);
    if (filters.genres.length > 0) p.set("with_genres", filters.genres.join(","));
    if (filters.year) p.set("primary_release_year", filters.year);
    if (filters.ratingGte != null && filters.ratingGte > 0) p.set("vote_average.gte", String(filters.ratingGte));
    if (sortBy) p.set("sort_by", sortBy);
    return p.toString();
  }, [query, page, filters, sortBy]);

  useEffect(() => {
    setPage(1);
    setPages([]);
  }, [query, filters.genres.join(","), filters.year, filters.language, filters.ratingGte, sortBy]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        if (!ignore) {
          setTotalPages(data.total_pages || 1);
          setPages((prev) => {
            const nextPage: PageData = { page: data.page, results: data.results, total_pages: data.total_pages };
            const replaced = prev.filter((p) => p.page !== data.page);
            return [...replaced, nextPage].sort((a, b) => a.page - b.page);
          });
        }
      } catch (e) {
        if (!ignore) setError(e instanceof Error ? e.message : "Failed to fetch");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [params]);

  useEffect(() => {
    if (!infinite) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !loading && page < totalPages) {
        setPage((p) => p + 1);
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [infinite, loading, page, totalPages]);

  const flatResults = pages.flatMap((p) => p.results);

  return (
    <div className="flex-1">
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200 p-4 mb-4">{error}</div>
      )}

      {flatResults.length === 0 && !loading && (
        <div className="text-center text-gray-600 dark:text-gray-400 p-10">No results found.</div>
      )}

      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {flatResults.map((m) => (
          <MovieCard key={m.id} movie={m} />
        ))}
        {loading && Array.from({ length: 10 }).map((_, i) => (
          <div key={`s-${i}`} className="animate-pulse rounded-2xl border border-black/10 dark:border-white/10 bg-white/40 dark:bg-black/20 aspect-[2/3]" />
        ))}
      </div>

      {/* Pagination */}
      {!infinite && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Prev
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const p = i + Math.max(1, Math.min(page - 3, totalPages - 6));
              const active = p === page;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-2 rounded-md border border-black/10 dark:border-white/10 ${active ? "bg-indigo-600 text-white" : ""}`}
                >
                  {p}
                </button>
              );
            })}
          </div>
          <button
            className="px-3 py-2 rounded-md border border-black/10 dark:border-white/10 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      )}

      {/* Load More */}
      <div className="flex justify-center mt-6">
        <button
          ref={loadMoreRef}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={loading || page >= totalPages}
          className="px-4 py-2 rounded-md border border-black/10 dark:border-white/10 disabled:opacity-50"
        >
          {page >= totalPages ? "No more" : loading ? "Loading..." : "Load More"}
        </button>
      </div>
    </div>
  );
}