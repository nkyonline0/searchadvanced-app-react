"use client";

import { useEffect, useState } from "react";
import SearchBar from "@/components/SearchBar";
import SortBar from "@/components/SortBar";
import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { useTheme } from "next-themes";

export type HeaderProps = {
  query: string;
  onQueryChange: (v: string) => void;
  onSearch: (v: string) => void;
  sortBy: string;
  onSortChange: (v: string) => void;
};

export default function Header({ query, onQueryChange, onSearch, sortBy, onSortChange }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/60 dark:bg-black/30 border-b border-black/10 dark:border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">Movie Search</div>
          <button
            className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Toggle dark mode"
            onClick={() => setTheme((resolvedTheme === "dark" ? "light" : "dark"))}
          >
            {mounted && resolvedTheme === "dark" ? (
              <SunIcon className="w-5 h-5" />
            ) : (
              <MoonIcon className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="flex-1">
            <SearchBar value={query} onChange={onQueryChange} onSubmit={onSearch} />
          </div>
          <SortBar sortBy={sortBy} onChange={onSortChange} />
        </div>
      </div>
    </header>
  );
}