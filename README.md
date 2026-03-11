# Photo Gallery App

A full-stack Next.js application where users can upload photos and add comments to them.

## Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **UI**: Ant Design v6 + Tailwind CSS v4
- **ORM**: Prisma v7
- **Database**: PostgreSQL
- **Validation**: Zod
- **File storage**: `/tmp/uploads` (served via API route — works on any platform)

## Features

- Upload photos (JPEG, PNG, GIF, WebP, AVIF)
- View all uploaded photos in a responsive gallery grid
- Add comments to any photo
- Comments and photos are persisted in PostgreSQL

> **Note on images**: Uploaded files are stored in `/tmp/uploads/` and served via `/api/uploads/[filename]`. On serverless platforms (e.g. Vercel) the file system is ephemeral — images are lost on cold starts. This is intentional per project requirements ("images don't need to be persistent").

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or cloud — e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com))

### 1. Clone the repo

```bash
git clone <your-repo-url>
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

This creates the `User`, `Photo`, and `Comment` tables.

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment (Vercel)

### 1. Create a PostgreSQL database

Use [Neon](https://neon.tech) (free tier, serverless Postgres):
1. Sign up at neon.tech
2. Create a new project
3. Copy the connection string from the dashboard

### 2. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect your GitHub repo directly at [vercel.com](https://vercel.com).

### 3. Set environment variables in Vercel

In the Vercel dashboard → Project → Settings → Environment Variables, add:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon (or other) PostgreSQL connection string |

### 4. Run migrations against the production database

```bash
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### 5. Redeploy

Trigger a redeploy from the Vercel dashboard (or push a new commit). The app will be live.

---

## Available Scripts

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # ESLint

npx prisma generate        # Regenerate Prisma client
npx prisma migrate dev     # Run migrations (development)
npx prisma migrate deploy  # Run migrations (production)
npx prisma studio          # Open Prisma Studio GUI
```

---

## Project Structure

```
photo-app/
├── app/
│   ├── layout.tsx              # Root layout (fonts, Ant Design provider)
│   ├── page.tsx                # Home page — upload form + gallery
│   ├── globals.css             # Tailwind + CSS variables
│   └── api/
│       ├── photos/
│       │   ├── route.ts        # GET /api/photos, POST /api/photos
│       │   └── [id]/comments/
│       │       └── route.ts    # POST /api/photos/:id/comments
│       └── uploads/
│           └── [filename]/
│               └── route.ts    # GET /api/uploads/:filename (file serving)
├── lib/
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # DB schema (User, Photo, Comment)
│   └── migrations/
└── prisma.config.ts            # Prisma v7 config
```

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
