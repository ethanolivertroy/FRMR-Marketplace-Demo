import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  // Handle relative URLs by reading from the public directory
  if (url.startsWith("/")) {
    try {
      const filePath = path.join(process.cwd(), "public", url);
      // Ensure the resolved path stays within the public directory
      const publicDir = path.join(process.cwd(), "public");
      if (!filePath.startsWith(publicDir)) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 });
      }
      const content = await readFile(filePath, "utf-8");
      const data = JSON.parse(content);
      return NextResponse.json(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return NextResponse.json({ error: `File read error: ${message}` }, { status: 502 });
    }
  }

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Fetch error: ${message}` }, { status: 502 });
  }
}
