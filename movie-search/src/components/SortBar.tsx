"use client";

export type SortBarProps = {
  sortBy: string;
  onChange: (v: string) => void;
};

const options = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "release_date.desc", label: "Release Date" },
  { value: "original_title.asc", label: "A → Z" },
  { value: "vote_average.desc", label: "Rating" },
];

export default function SortBar({ sortBy, onChange }: SortBarProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="sort" className="text-sm text-gray-600 dark:text-gray-400">Sort by</label>
      <select
        id="sort"
        value={sortBy}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-md border border-black/10 dark:border-white/10 bg-transparent px-2 py-2"
        aria-label="Sort results"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}