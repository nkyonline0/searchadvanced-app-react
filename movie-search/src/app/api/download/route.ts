import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const url = `https://www.themoviedb.org/movie/${encodeURIComponent(id)}`;
  return NextResponse.json({ url });
}