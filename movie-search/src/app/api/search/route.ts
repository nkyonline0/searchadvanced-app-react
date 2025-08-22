import { NextRequest, NextResponse } from "next/server";
import { discoverMovies, searchMovies, TmdbMovie, TmdbPaginatedResponse } from "@/lib/tmdb";

function sortClient(results: TmdbMovie[], sortBy?: string) {
  switch (sortBy) {
    case "release_date.desc":
      return [...results].sort((a, b) => (b.release_date || "").localeCompare(a.release_date || ""));
    case "release_date.asc":
      return [...results].sort((a, b) => (a.release_date || "").localeCompare(b.release_date || ""));
    case "original_title.asc":
      return [...results].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
    case "vote_average.desc":
      return [...results].sort((a, b) => b.vote_average - a.vote_average);
    default:
      return [...results].sort((a, b) => b.popularity - a.popularity);
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || undefined;
  const page = Number(searchParams.get("page") || "1");
  const language = searchParams.get("language") || undefined;
  const with_genres = searchParams.get("with_genres") || undefined;
  const primary_release_year = searchParams.get("primary_release_year") || undefined;
  const vote_gte = searchParams.get("vote_average.gte") || undefined;
  const sort_by = searchParams.get("sort_by") || undefined;

  try {
    let data: TmdbPaginatedResponse<TmdbMovie>;
    if (query) {
      data = await searchMovies(query, page, language);
      if (with_genres || primary_release_year || vote_gte || sort_by) {
        const filtered = data.results.filter((m) => {
          const matchesGenres = with_genres
            ? with_genres.split(",").some(() => true)
            : true;
          const matchesYear = primary_release_year ? (m.release_date || "").startsWith(String(primary_release_year)) : true;
          const matchesVote = vote_gte ? m.vote_average >= Number(vote_gte) : true;
          return matchesGenres && matchesYear && matchesVote;
        });
        data = { ...data, results: sortClient(filtered, sort_by) };
      }
    } else {
      data = await discoverMovies({
        page,
        language,
        with_genres,
        primary_release_year,
        "vote_average.gte": vote_gte ? Number(vote_gte) : undefined,
        sort_by: sort_by || "popularity.desc",
      });
    }
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}