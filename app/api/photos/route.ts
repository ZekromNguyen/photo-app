import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { z } from "zod";
import sharp from "sharp";
import prisma from "@/lib/prisma";

const PAGE_SIZE = 12;

const DUMMY_USER_ID = 1;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/avif",
]);

async function ensureDummyUser() {
  await prisma.user.upsert({
    where: { id: DUMMY_USER_ID },
    update: {},
    create: {
      id: DUMMY_USER_ID,
      name: "Guest",
      email: "guest@photo-app.local",
      password: "n/a",
    },
  });
}

const fileSchema = z
  .instanceof(File)
  .refine((f) => f.size > 0, "File is required")
  .refine((f) => f.size <= MAX_FILE_SIZE, "File size must be 10MB or less")
  .refine(
    (f) => ALLOWED_MIME_TYPES.has(f.type),
    "Only image files are allowed (JPEG, PNG, GIF, WebP, AVIF)"
  );

async function compressImage(buffer: Buffer, mimeType: string): Promise<{ data: Buffer; mimeType: string }> {
  // GIFs are kept as-is (sharp doesn't support animated GIF output well)
  if (mimeType === "image/gif") return { data: buffer, mimeType };

  const compressed = await sharp(buffer)
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  return { data: compressed, mimeType: "image/webp" };
}

async function saveFile(validFile: File): Promise<{ id: number; url: string; filename: string | null; createdAt: Date }> {
  const raw = Buffer.from(await validFile.arrayBuffer());
  const { data, mimeType } = await compressImage(raw, validFile.type);

  const ext = mimeType === "image/webp" ? ".webp" : (path.extname(validFile.name) || ".jpg");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

  return prisma.photo.create({
    data: {
      url: `/api/uploads/${filename}`,
      filename: validFile.name,
      data,
      mimeType,
      userId: DUMMY_USER_ID,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Support both multiple files (key "files") and single file (key "file")
    const rawFiles = [
      ...formData.getAll("files"),
      ...formData.getAll("file"),
    ].filter((v): v is File => v instanceof File);

    if (rawFiles.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const validFiles: File[] = [];
    const errors: { index: number; error: unknown }[] = [];
    for (let i = 0; i < rawFiles.length; i++) {
      const parsed = fileSchema.safeParse(rawFiles[i]);
      if (parsed.success) {
        validFiles.push(parsed.data);
      } else {
        errors.push({ index: i, error: parsed.error.flatten() });
      }
    }

    if (validFiles.length === 0) {
      return NextResponse.json({ error: "All files failed validation", details: errors }, { status: 400 });
    }

    await ensureDummyUser();

    const photos = await Promise.all(validFiles.map(saveFile));

    return NextResponse.json(
      photos.map((p) => ({ id: p.id, url: p.url, filename: p.filename, createdAt: p.createdAt })),
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/photos error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cursorParam = searchParams.get("cursor");
    const cursor = cursorParam ? parseInt(cursorParam, 10) : undefined;

    // Fetch one extra record to determine whether a next page exists
    const photos = await prisma.photo.findMany({
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: "desc" },
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

    const hasMore = photos.length > PAGE_SIZE;
    const page = hasMore ? photos.slice(0, PAGE_SIZE) : photos;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return NextResponse.json({ photos: page, nextCursor, hasMore });
  } catch (err) {
    console.error("GET /api/photos error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
