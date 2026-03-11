import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const UPLOADS_DIR = path.join("/tmp", "uploads");

// Allowed image extensions — prevents directory traversal via extension check
// and path.basename below ensures no path segments are accepted.
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  // Sanitize: strip any path separators so callers cannot traverse directories
  const safeFilename = path.basename(filename);
  const ext = path.extname(safeFilename).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const filePath = path.join(UPLOADS_DIR, safeFilename);
    const buffer = await readFile(filePath);

    const mimeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".avif": "image/avif",
    };

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": mimeMap[ext] ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
