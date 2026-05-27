# Property Ops

A pilot-ready multi-role SaaS prototype for serviced-apartment and short-stay property operators. Built as a test task demonstrating senior full-stack architecture: multi-role auth, enforced task state transitions, evidence uploads, and an append-only audit trail.

> 🎬 [Watch the demo](https://www.loom.com/share/4a53774255484c12b9cae5073692147b)

---

## Tech Stack

|Layer|Technology|
|---|---|
|Framework|Next.js 16 (App Router, Server Actions, Server Components)|
|Language|TypeScript 5 — strict mode, zero `any`|
|Styling|Tailwind CSS v4 + shadcn/ui|
|Database|PostgreSQL via Supabase|
|ORM|Prisma 7|
|Auth|Supabase Auth (JWT, email/password)|
|Storage|Supabase Storage (private bucket, signed URLs)|
|Validation|Zod v4|
|CI|GitHub Actions|

---

## Architecture Highlights

- **Server Actions** for all mutations — no REST API routes for CRUD
- **Two-layer RBAC** — route guard in `proxy.ts` + ownership checks in every service function
- **Task state machine** in a single file (`lib/state-machine.ts`) — the only source of truth for valid transitions
- **`Result<T>` error pattern** — service functions never throw; all failure paths are typed and handled explicitly
- **Append-only audit log** — every meaningful action is recorded automatically, with `before`/`after` JSON snapshots
- **Prisma bypasses RLS** — permission logic lives in code, not database policies, making it explicit and auditable

---

## Roles

|Role|Access|
|---|---|
|**Admin**|Full access — create properties and tasks, cancel tasks, manage users, view audit log|
|**Operator**|Execute tasks — transition status, upload evidence photos|
|**Host**|Read-only — view their own property and associated tasks|

---

## Demo Credentials

|Role|Email|Password|
|---|---|---|
|Admin|admin@test.com|password123|
|Operator|operator@test.com|password123|
|Host|host@test.com|password123|

---

## Getting Started

### Prerequisites

- Node.js v20+
- A Supabase project (database + auth + storage)

### 1. Clone the repo

```bash
git clone https://github.com/thekevinkun/property-ops.git
cd property-ops
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

> **Two connection strings are needed:**
> 
> - `.env` — direct connection (port 5432) — used by Prisma CLI for migrations and seeding
> - `.env.local` — transaction mode (port 6543, `?pgbouncer=true`) — used by the Next.js app at runtime

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

### 5. Seed demo data

```bash
npx prisma db seed
```

This creates three users (Admin, Operator, Host), one property, four tasks across all statuses, and a pre-built audit trail.

### 6. Start the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000/) and log in with any of the demo credentials above.

---

## Project Structure

```
property-ops/
├── app/
│   ├── (auth)/               — Login page
│   ├── (dashboard)/          — Protected dashboard (all roles)
│   │   ├── properties/       — Property list + detail
│   │   ├── tasks/            — Task list + detail + create
│   │   ├── audit/            — Audit log (Admin only)
│   │   └── users/            — User management (Admin only)
│   └── api/upload/           — File upload route (Supabase Storage)
├── services/                 — Business logic + DB queries
├── actions/                  — Server Actions
├── lib/
│   ├── state-machine.ts      — Task transition logic (single source of truth)
│   ├── audit.ts              — Append-only audit log writer
│   └── prisma.ts             — Prisma client singleton
├── types/                    — All shared TypeScript types
├── proxy.ts                  — Route-level auth + role guard (Next.js 16)
└── prisma/
    ├── schema.prisma          — Full database schema
    └── seed.ts               — Demo data seed script
```

---

## CI

GitHub Actions runs on every PR and push to `master`:

1. `npx prisma generate`
2. `npm run typecheck`
3. `npm run lint`
4. `npx prisma validate`
5. `npm run build`

---

## What This Is Not

This is a **prototype**, not a production deployment. There is no live URL — the app runs locally against your own Supabase project. The goal is to demonstrate architecture and engineering decisions, not a hosted product.