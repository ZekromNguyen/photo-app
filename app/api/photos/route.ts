import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { z } from "zod";
import prisma from "@/lib/prisma";

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

const uploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, "File is required")
    .refine((f) => f.size <= MAX_FILE_SIZE, "File size must be 10MB or less")
    .refine(
      (f) => ALLOWED_MIME_TYPES.has(f.type),
      "Only image files are allowed (JPEG, PNG, GIF, WebP, AVIF)"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    const parsed = uploadSchema.safeParse({ file });
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const validFile = parsed.data.file;
    const ext = path.extname(validFile.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const buffer = Buffer.from(await validFile.arrayBuffer());

    await ensureDummyUser();

    const photo = await prisma.photo.create({
      data: {
        url: `/api/uploads/${filename}`,
        filename: validFile.name,
        data: buffer,
        mimeType: validFile.type,
        userId: DUMMY_USER_ID,
      },
    });

    return NextResponse.json(
      { id: photo.id, url: photo.url, filename: photo.filename, createdAt: photo.createdAt },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/photos error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  try {
    const photos = await prisma.photo.findMany({
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

    return NextResponse.json(photos);
  } catch (err) {
    console.error("GET /api/photos error:", err);
    const msg = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
