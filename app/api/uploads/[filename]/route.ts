import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;

  try {
    // Find the photo by its URL pattern
    const photo = await prisma.photo.findFirst({
      where: { url: `/api/uploads/${filename}` },
      select: { data: true, mimeType: true },
    });

    if (!photo?.data) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return new NextResponse(photo.data, {
      headers: {
        "Content-Type": photo.mimeType ?? "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
