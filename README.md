# 📸 Photo Gallery App

> A full-stack Next.js application for uploading photos and adding comments — built as a job assignment for Qode.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?logo=prisma)](https://prisma.io)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com)

## Features

- 📤 **Upload photos** — drag-and-drop or click to select (JPEG, PNG, GIF, WebP, AVIF, max 10 MB)
- 🖼️ **Gallery view** — responsive grid showing all uploaded photos
- 💬 **Comments** — add comments to any photo, persisted in PostgreSQL
- 🗄️ **Database storage** — images stored as binary in PostgreSQL (works on serverless / Vercel)

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.1.6 (App Router, TypeScript) |
| UI | Ant Design v6 + Tailwind CSS v4 |
| ORM | Prisma v7 |
| Database | PostgreSQL (Neon recommended) |
| Validation | Zod v4 |
| Deployment | Vercel |

---

## API Reference

### `GET /api/photos`

Returns all photos with their comments. Image binary is excluded for performance.

**Response `200`**

```json
[
  {
    "id": 1,
    "url": "/api/uploads/1710000000000-abc123.jpg",
    "filename": "my-photo.jpg",
    "createdAt": "2026-03-11T14:00:00.000Z",
    "user": { "name": "Guest" },
    "comments": [
      {
        "id": 1,
        "content": "Nice photo!",
        "createdAt": "2026-03-11T15:00:00.000Z",
        "user": { "name": "Guest" }
      }
    ]
  }
]
```

---

### `POST /api/photos`

Upload a new photo. Accepts `multipart/form-data`.

**Request**

| Field | Type | Rules |
|-------|------|-------|
| `file` | `File` | Image only · Max 10 MB · JPEG, PNG, GIF, WebP, AVIF |

**Response `201`**

```json
{
  "id": 1,
  "url": "/api/uploads/1710000000000-abc123.jpg",
  "filename": "my-photo.jpg",
  "createdAt": "2026-03-11T14:00:00.000Z"
}
```

**Error `400`** — validation failed

```json
{ "error": { "file": ["File size must be 10MB or less"] } }
```

---

### `GET /api/uploads/[filename]`

Serves an uploaded image from the database.

- **Response `200`** — raw image bytes with correct `Content-Type` header
- **Response `404`** — `{ "error": "Not found" }`

---

### `POST /api/photos/[id]/comments`

Add a comment to a photo.

**Request body**

```json
{ "content": "Amazing shot!" }
```

| Field | Type | Rules |
|-------|------|-------|
| `content` | `string` | 1–1000 characters |

**Response `201`**

```json
{
  "id": 5,
  "content": "Amazing shot!",
  "createdAt": "2026-03-11T16:00:00.000Z",
  "user": { "name": "Guest" }
}
```

**Response `404`** — `{ "error": "Photo not found" }`

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL (local install, or cloud — [Neon](https://neon.tech) free tier)

### 1. Clone the repo

```bash
git clone https://github.com/ZekromNguyen/photo-app.git
cd photo-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Replace the placeholder values with your actual PostgreSQL connection string.

### 4. Run database migrations

```bash
npx prisma migrate dev
```

Creates the `User`, `Photo`, and `Comment` tables.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Vercel + Neon)

### 1. Create a Neon database

1. Sign up at [neon.tech](https://neon.tech) (free tier)
2. Create a new project
3. Copy the connection string: `postgresql://user:pass@host/neondb?sslmode=require`

### 2. Deploy to Vercel

Push to GitHub and import at [vercel.com/new](https://vercel.com/new), **or** use the CLI:

```bash
npx vercel
```

### 3. Set environment variable in Vercel

Vercel dashboard → Project → **Settings** → **Environment Variables**:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |

### 4. Run production migrations (first time only)

Create the tables in your Neon database before first use:

```powershell
# PowerShell
$env:DATABASE_URL="postgresql://..."; npx prisma migrate deploy
```

```bash
# Bash / macOS / Linux
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### 5. Redeploy

Trigger a redeploy from the Vercel dashboard (or push a new commit).

> **Note**: Subsequent deploys automatically run `prisma migrate deploy && next build` via the `build` script — no manual migration needed after the first time.

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (http://localhost:3000) |
| `npm run build` | Production build (runs migrations first) |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma generate` | Regenerate Prisma client |
| `npx prisma migrate dev` | Run migrations (development) |
| `npx prisma migrate deploy` | Run migrations (production) |
| `npx prisma studio` | Open Prisma Studio GUI |

---

## Project Structure

```
photo-app/
├── app/
│   ├── page.tsx                    # Home page — gallery + upload
│   ├── layout.tsx                  # Root layout (fonts, Ant Design provider)
│   ├── globals.css                 # Global styles
│   ├── components/
│   │   ├── UploadForm.tsx          # Drag-and-drop upload UI
│   │   ├── PhotoCard.tsx           # Individual photo card with comments
│   │   └── CommentSection.tsx      # Comment list + add comment input
│   └── api/
│       ├── photos/
│       │   ├── route.ts            # GET /api/photos, POST /api/photos
│       │   └── [id]/comments/
│       │       └── route.ts        # POST /api/photos/:id/comments
│       └── uploads/[filename]/
│           └── route.ts            # GET /api/uploads/:filename
├── lib/
│   └── prisma.ts                   # Prisma client singleton
├── prisma/
│   ├── schema.prisma               # DB schema (User, Photo, Comment)
│   └── migrations/                 # SQL migration files
└── prisma.config.ts                # Prisma v7 datasource config
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
