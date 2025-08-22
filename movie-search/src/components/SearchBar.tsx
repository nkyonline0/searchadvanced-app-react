"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";

type Suggestion = { id: number; title: string; year?: string };

export type SearchBarProps = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  language?: string;
};

export default function SearchBar({ value, onChange, onSubmit, language }: SearchBarProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedFetch = useMemo(() => {
    let timeout: NodeJS.Timeout | null = null;
    return (q: string) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(async () => {
        if (!q.trim()) {
          setSuggestions([]);
          return;
        }
        const params = new URLSearchParams({ query: q });
        if (language) params.set("language", language);
        const res = await fetch(`/api/suggestions?${params.toString()}`);
        const data = await res.json();
        setSuggestions(data.results || []);
        setOpen(true);
        setActiveIndex(-1);
      }, 250);
    };
  }, [language]);

  useEffect(() => {
    debouncedFetch(value);
  }, [value, debouncedFetch]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        const s = suggestions[activeIndex];
        onSubmit(s.title);
        setOpen(false);
      } else {
        onSubmit(value);
        setOpen(false);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const handleBlur = useCallback((e: React.FocusEvent) => {
    const next = e.relatedTarget as HTMLElement | null;
    if (!next || !listRef.current?.contains(next)) {
      setOpen(false);
    }
  }, []);

  return (
    <div className="relative w-full" role="search">
      <div className="flex items-center gap-2 rounded-xl bg-white/80 dark:bg-black/30 ring-1 ring-black/10 dark:ring-white/10 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 backdrop-blur">
        <MagnifyingGlassIcon className="w-5 h-5 text-gray-500" aria-hidden />
        <input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={() => value && setOpen(true)}
          placeholder="Search movies..."
          className="w-full bg-transparent outline-none text-sm md:text-base placeholder:text-gray-400"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              inputRef.current?.focus();
              setSuggestions([]);
              setOpen(false);
            }}
            aria-label="Clear search"
            className="p-1 rounded hover:bg-black/5 dark:hover:bg-white/10"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul
          id="search-suggestions"
          ref={listRef}
          role="listbox"
          className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-xl"
        >
          {suggestions.map((s, idx) => (
            <li
              id={`suggestion-${idx}`}
              key={s.id}
              role="option"
              aria-selected={activeIndex === idx}
              tabIndex={-1}
              onMouseDown={() => {
                onSubmit(s.title);
                setOpen(false);
              }}
              className={`cursor-pointer px-3 py-2 text-sm md:text-base hover:bg-black/5 dark:hover:bg-white/10 ${activeIndex === idx ? "bg-black/5 dark:bg-white/10" : ""}`}
            >
              <span className="font-medium">{s.title}</span>
              {s.year && <span className="ml-2 text-gray-500">({s.year})</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}