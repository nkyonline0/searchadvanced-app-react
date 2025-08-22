"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDownIcon, FunnelIcon } from "@heroicons/react/24/outline";

type Genre = { id: number; name: string };

export type FiltersState = {
  genres: number[];
  year?: string;
  language?: string;
  ratingGte?: number;
};

export type FiltersProps = {
  value: FiltersState;
  onChange: (v: FiltersState) => void;
};

const languages = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "de", label: "German" },
  { code: "ja", label: "Japanese" },
  { code: "ko", label: "Korean" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Chinese" },
];

export default function Filters({ value, onChange }: FiltersProps) {
  const [open, setOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/genres");
      const data = await res.json();
      setGenres(data.genres || []);
    })();
  }, []);

  const years = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 60 }, (_, i) => String(current - i));
  }, []);

  return (
    <aside className="w-full md:w-64">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="md:hidden w-full flex items-center justify-between rounded-xl border border-black/10 dark:border-white/10 px-3 py-2 bg-white/60 dark:bg-black/30"
        aria-expanded={open}
        aria-controls="filter-panel"
      >
        <span className="flex items-center gap-2"><FunnelIcon className="w-5 h-5" /> Filters</span>
        <ChevronDownIcon className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <div id="filter-panel" className={`mt-3 md:mt-0 md:block overflow-hidden transition-[max-height,opacity] duration-300 ${open ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0 md:max-h-none md:opacity-100"}`}>
        <div className="md:sticky md:top-4 space-y-4 rounded-xl border border-black/10 dark:border-white/10 p-4 bg-white/60 dark:bg-black/30 backdrop-blur">
          <div>
            <label className="text-sm font-medium">Genre</label>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {genres.map((g) => {
                const checked = value.genres.includes(g.id);
                return (
                  <label key={g.id} className={`flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer select-none ring-1 ring-black/10 dark:ring-white/10 ${checked ? "bg-indigo-500/10" : ""}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...value.genres, g.id]
                          : value.genres.filter((id) => id !== g.id);
                        onChange({ ...value, genres: next });
                      }}
                    />
                    <span className="text-sm">{g.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Release Year</label>
            <select
              value={value.year || ""}
              onChange={(e) => onChange({ ...value, year: e.target.value || undefined })}
              className="mt-2 w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-2 py-2"
            >
              <option value="">Any</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Language</label>
            <select
              value={value.language || ""}
              onChange={(e) => onChange({ ...value, language: e.target.value || undefined })}
              className="mt-2 w-full rounded-md border border-black/10 dark:border-white/10 bg-transparent px-2 py-2"
            >
              <option value="">Any</option>
              {languages.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Rating (min)</label>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={value.ratingGte ?? 0}
              onChange={(e) => onChange({ ...value, ratingGte: Number(e.target.value) })}
              className="mt-2 w-full"
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{value.ratingGte ?? 0}+</div>
          </div>
        </div>
      </div>
    </aside>
  );
}