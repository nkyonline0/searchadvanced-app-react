"use client";

import Image from "next/image";
import { ArrowDownTrayIcon, StarIcon } from "@heroicons/react/24/solid";
import { TmdbMovie, getPosterUrl } from "@/lib/tmdb";

function Stars({ rating }: { rating: number }) {
  const stars = Math.round(rating) / 2; // TMDb is /10
  return (
    <div className="flex items-center" aria-label={`Rating ${rating}/10`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} className={`w-4 h-4 ${i < stars ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}`} />
      ))}
      <span className="ml-1 text-xs text-gray-600 dark:text-gray-400">{rating.toFixed(1)}</span>
    </div>
  );
}

export type MovieCardProps = {
  movie: TmdbMovie;
  onFavoriteToggle?: (id: number) => void;
  favorited?: boolean;
};

export default function MovieCard({ movie, onFavoriteToggle, favorited }: MovieCardProps) {
  const poster = getPosterUrl(movie.poster_path, "w342");
  const year = movie.release_date?.slice(0, 4) || "";

  return (
    <div className="group rounded-2xl border border-black/10 dark:border-white/10 overflow-hidden bg-white/60 dark:bg-black/30 backdrop-blur hover:shadow-xl hover:-translate-y-1 transition-all">
      <div className="relative aspect-[2/3] w-full">
        {poster ? (
          <Image
            src={poster}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
            priority={false}
          />
        ) : (
          <div className="h-full w-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center text-gray-500">No Image</div>
        )}
        <a
          href={`/api/download?id=${movie.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 right-3 p-2 rounded-full bg-indigo-600 text-white shadow-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-white"
          aria-label={`Download ${movie.title}`}
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
        </a>
      </div>
      <div className="p-3 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-sm md:text-base line-clamp-1">{movie.title}</h3>
          <span className="text-xs text-gray-600 dark:text-gray-400">{year}</span>
        </div>
        <Stars rating={movie.vote_average} />
        <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 line-clamp-3">{movie.overview || "No overview available."}</p>
      </div>
    </div>
  );
}