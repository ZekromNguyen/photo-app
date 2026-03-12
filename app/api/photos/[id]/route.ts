import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const updateSchema = z.object({
  filename: z.string().min(1).max(255).optional(),
});

type Params = { params: Promise<{ id: string }> };

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return isNaN(n) ? null : n;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const photoId = parseId(id);
  if (!photoId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      select: {
        id: true,
        url: true,
        filename: true,
        createdAt: true,
        user: { select: { name: true } },
        comments: {
          orderBy: { createdAt: "asc" },
          include: { user: { select: { name: true } } },
        },
      },
    });
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    return NextResponse.json(photo);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const photoId = parseId(id);
  if (!photoId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

    const updated = await prisma.photo.update({
      where: { id: photoId },
      data: parsed.data,
      select: { id: true, url: true, filename: true, createdAt: true },
    });
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const photoId = parseId(id);
  if (!photoId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const photo = await prisma.photo.findUnique({ where: { id: photoId } });
    if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

    // Delete related comments first (no onDelete: Cascade in schema)
    await prisma.comment.deleteMany({ where: { photoId } });
    await prisma.photo.delete({ where: { id: photoId } });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
