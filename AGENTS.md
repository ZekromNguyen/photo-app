# AGENTS.md — photo-app

## Project Overview

A Next.js photo upload and commenting application. Users can upload photos, view all uploaded photos, and add comments to them. This is a full-stack app using Next.js API routes for the backend.

**Status**: Freshly scaffolded via `create-next-app`. The `app/page.tsx` still contains the default Next.js starter content. Core application features (photo upload, comments, gallery) have **not yet been implemented**.

## Tech Stack

| Layer      | Technology                                       |
|------------|--------------------------------------------------|
| Framework  | Next.js 16.1.6 (App Router)                      |
| Language   | TypeScript (strict mode)                          |
| UI Library | Ant Design (`antd` v6.3.2)                        |
| Styling    | Tailwind CSS v4 (via `@tailwindcss/postcss`)      |
| ORM        | Prisma v7.4.2                                     |
| Database   | PostgreSQL                                        |
| Validation | Zod v4.3.6                                        |
| Uploads    | Multer v2.1.1                                     |
| Fonts      | Geist / Geist Mono (via `next/font/google`)       |
| React      | React 19.2.3                                      |

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run start     # Start production server
npm run lint      # Run ESLint (next/core-web-vitals + typescript rules)
```

### Prisma Commands

```bash
npx prisma generate   # Generate Prisma Client (outputs to app/generated/prisma)
npx prisma migrate dev # Run migrations in development
npx prisma db push     # Push schema to database without migrations
npx prisma studio      # Open Prisma Studio GUI
```

## Environment Variables

A `.env` file is required but not committed (`.gitignore` excludes `.env*`). Required variable:

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

The Prisma config (`prisma.config.ts`) reads `DATABASE_URL` from `process.env` via `dotenv/config`.

## Project Structure

```
photo-app/
├── app/                    # Next.js App Router directory
│   ├── layout.tsx          # Root layout (Geist fonts, global CSS)
│   ├── page.tsx            # Home page (currently default starter)
│   ├── globals.css         # Global styles (Tailwind + CSS variables)
│   ├── favicon.ico
│   └── generated/prisma/   # Prisma Client output (gitignored)
├── prisma/
│   ├── schema.prisma       # Database schema (User, Photo, Comment)
│   └── migrations/         # Prisma migration files
├── public/                 # Static assets (SVGs)
├── package.json
├── tsconfig.json
├── next.config.ts          # Next.js config (currently empty)
├── eslint.config.mjs       # ESLint flat config
├── postcss.config.mjs      # PostCSS with Tailwind plugin
└── prisma.config.ts        # Prisma config (datasource URL, migration path)
```

### Conventions for New Files

- **Pages**: `app/<route>/page.tsx` (App Router convention)
- **API Routes**: `app/api/<endpoint>/route.ts` (Next.js Route Handlers)
- **Components**: No component directory exists yet — create `app/components/` or `components/` following Next.js conventions
- **Prisma Client**: Import from `app/generated/prisma` (see `.gitignore` line `/app/generated/prisma`)

## Database Schema

Three models defined in `prisma/schema.prisma`:

### User
- `id` (Int, autoincrement PK)
- `name` (String)
- `email` (String, unique)
- `password` (String)
- `createdAt` (DateTime)
- Relations: has many `Photo`, has many `Comment`

### Photo
- `id` (Int, autoincrement PK)
- `url` (String)
- `filename` (String, optional)
- `createdAt` (DateTime)
- `userId` (Int, FK → User)
- Relations: belongs to `User`, has many `Comment`

### Comment
- `id` (Int, autoincrement PK)
- `content` (String)
- `createdAt` (DateTime)
- `photoId` (Int, FK → Photo)
- `userId` (Int, FK → User)
- Relations: belongs to `Photo`, belongs to `User`

**Note**: No `datasource` or `generator` blocks are present in `schema.prisma` — these are configured externally via `prisma.config.ts`. The Prisma v7 config file approach is used instead of inline schema configuration.

## Code Patterns & Conventions

### TypeScript
- Strict mode enabled (`"strict": true` in tsconfig)
- Path alias: `@/*` maps to project root (e.g., `import { Foo } from "@/app/components/Foo"`)
- Target: ES2017
- Module resolution: `bundler`

### Styling
- Tailwind CSS v4 with PostCSS integration (not the older `tailwind.config.js` approach)
- CSS variables for theming (`--background`, `--foreground`) defined in `globals.css`
- Dark mode support via `prefers-color-scheme` media query
- Ant Design is installed — use its components for UI (forms, buttons, cards, modals, upload, etc.)
- Both Tailwind utility classes and Ant Design components can coexist

### ESLint
- Flat config format (`eslint.config.mjs`)
- Extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Fonts
- Geist Sans and Geist Mono loaded via `next/font/google` in `app/layout.tsx`
- Exposed as CSS variables `--font-geist-sans` and `--font-geist-mono`

## Important Gotchas

1. **No `datasource`/`generator` in schema.prisma**: This project uses Prisma v7's `prisma.config.ts` to configure the datasource URL and output. Don't add `datasource` or `generator` blocks to `schema.prisma` — they'll conflict with `prisma.config.ts`.

2. **Prisma Client output path**: Generated client goes to `app/generated/prisma/` (gitignored). After schema changes, run `npx prisma generate` before importing the client.

3. **No `.env` file committed**: You must create `.env` with a valid `DATABASE_URL` before running Prisma commands or starting the app with database features.

4. **Multer for file uploads**: `multer` v2.1.1 is installed for handling multipart form uploads. In Next.js API routes, you may need to disable the default body parser (`export const config = { api: { bodyParser: false } }`) or use the App Router's native `Request` object with `formData()`.

5. **Images not persistent**: Per project requirements, uploaded images do not need to be stored permanently. Local filesystem storage (e.g., `public/uploads/`) or in-memory handling is acceptable.

6. **Tailwind v4**: Uses the new `@import "tailwindcss"` syntax and `@theme inline` directive instead of the older `@tailwind` directives. The PostCSS plugin is `@tailwindcss/postcss`, not the legacy `tailwindcss` plugin.

7. **Next.js 16 + React 19**: This uses cutting-edge versions. Server Components are the default in the `app/` directory — add `"use client"` directive at the top of files that need browser APIs, state, or effects.

8. **Ant Design + Tailwind**: Both are installed. Ant Design components may need `"use client"` since they use React state/effects internally. Consider creating a client-side wrapper or marking pages that use Antd components.

9. **Zod for validation**: Zod v4 is installed for schema validation. Use it to validate API request bodies in route handlers.

## Features to Implement

Based on the project requirements (for agent context):

1. **Photo Upload** — Upload photos via the UI, store metadata in DB, save file to local storage
2. **Add Comments** — Comment on any uploaded photo, stored in DB with user association
3. **Gallery View** — Display all uploaded photos with their comments
4. **User Model** — Schema has User model with auth fields, but auth may be simplified or skipped for MVP

## Testing

No test framework is currently configured. No test files exist. If tests are needed:
- Consider `vitest` or `jest` with `@testing-library/react` for component tests
- API routes can be tested with direct fetch calls or `supertest`
