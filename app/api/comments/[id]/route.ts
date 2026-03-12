import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const updateSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000),
});

type Params = { params: Promise<{ id: string }> };

function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return isNaN(n) ? null : n;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const commentId = parseId(id);
  if (!commentId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    const updated = await prisma.comment.update({
      where: { id: commentId },
      data: { content: parsed.data.content },
      include: { user: { select: { name: true } } },
    });
    return NextResponse.json(updated);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const commentId = parseId(id);
  if (!commentId) return NextResponse.json({ error: "Invalid ID" }, { status: 400 });

  try {
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

    await prisma.comment.delete({ where: { id: commentId } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
