import { NextRequest, NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || "";
  const language = searchParams.get("language") || undefined;
  if (!query.trim()) {
    return NextResponse.json({ results: [] });
  }
  try {
    const data = await searchMovies(query, 1, language);
    const suggestions = data.results.slice(0, 7).map((m) => ({
      id: m.id,
      title: m.title,
      year: m.release_date ? m.release_date.split("-")[0] : undefined,
    }));
    return NextResponse.json({ results: suggestions });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}