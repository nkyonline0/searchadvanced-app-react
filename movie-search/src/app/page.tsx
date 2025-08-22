"use client";

import { useCallback, useState } from "react";
import Header from "@/components/Header";
import Filters, { FiltersState } from "@/components/Filters";
import ResultsGrid from "@/components/ResultsGrid";

export default function Home() {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [filters, setFilters] = useState<FiltersState>({ genres: [], ratingGte: 0 });
  const [infinite, setInfinite] = useState(true);

  const handleSearch = useCallback((q: string) => {
    setQuery(q);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen">
      <Header
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <main className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
        <Filters value={filters} onChange={setFilters} />
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">{query ? `Results for "${query}"` : "Discover"}</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={infinite} onChange={(e) => setInfinite(e.target.checked)} />
              Infinite Scroll
            </label>
          </div>
          <ResultsGrid query={query} filters={filters} sortBy={sortBy} infinite={infinite} />
        </div>
      </main>
    </div>
  );
}
