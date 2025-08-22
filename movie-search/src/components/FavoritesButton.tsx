"use client";

import { HeartIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";

export default function FavoritesButton({ movieId }: { movieId: number }) {
  const key = "favoriteMovies";
  const [fav, setFav] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const ids: number[] = JSON.parse(raw);
      setFav(ids.includes(movieId));
    } catch {}
  }, [movieId]);

  const toggle = () => {
    const raw = localStorage.getItem(key);
    let ids: number[] = [];
    try { ids = raw ? JSON.parse(raw) : []; } catch { ids = []; }
    if (ids.includes(movieId)) {
      ids = ids.filter((id) => id !== movieId);
      setFav(false);
    } else {
      ids.push(movieId);
      setFav(true);
    }
    localStorage.setItem(key, JSON.stringify(ids));
  };

  return (
    <button
      onClick={toggle}
      aria-pressed={fav}
      aria-label={fav ? "Remove from favorites" : "Add to favorites"}
      className={`p-2 rounded-full ${fav ? "text-red-500" : "text-gray-400"} hover:bg-black/5 dark:hover:bg-white/10`}
    >
      <HeartIcon className="w-5 h-5" />
    </button>
  );
}