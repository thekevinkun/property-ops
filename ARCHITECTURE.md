# Architecture Note — Property Ops

This document explains the key decisions behind this prototype. Not every decision is perfect, but each one was made for a reason. The goal here is to be transparent about the thinking, not just show the output.

---

## What the App Does

Property Ops is a task management tool for short-stay and serviced-apartment operators. Three types of users interact with it: an **Admin** who manages everything, an **Operator** (staff or cleaner) who executes tasks, and a **Host** (property owner) who can only view their own property and its tasks.

The core workflow is simple: Admin creates a property and assigns tasks to Operators. Operators complete the tasks and upload evidence photos. Hosts can see the progress. Every action is recorded in an audit log.

---

## Tech Stack

|Layer|Choice|
|---|---|
|Framework|Next.js 16 with App Router and Server Actions|
|Language|TypeScript 5, strict mode|
|Styling|Tailwind CSS v4 and shadcn/ui|
|Database|PostgreSQL hosted on Supabase|
|ORM|Prisma 7|
|Auth|Supabase Auth|
|File Storage|Supabase Storage|
|Validation|Zod v4|
|CI|GitHub Actions|

Nothing exotic. These are tools that are well-documented, widely used, and easy for another developer to pick up.

---

## Database Design

There are five tables: `users`, `properties`, `tasks`, `evidence`, and `audit_logs`.

A few specific decisions worth explaining:

**Tasks have two separate user fields.** `createdById` tracks who created the task (always Admin), and `assignedToId` tracks who is doing it (an Operator). These are not the same person, so they are stored separately. `assignedToId` is also nullable because a task can exist before it gets assigned.

The `evidence` table has no `updatedAt` column. Photos can be deleted, but every deletion writes an entry to the audit log with the file name, who deleted it, and when. The photo is gone from storage, but the record that it existed is not. Same applies to property deletion. Nothing disappears silently.

**The audit log stores before and after snapshots.** Each row in `audit_logs` has a `before` and `after` JSON field. This means you can look at any audit entry and see exactly what changed, without needing to join other tables or piece together history from multiple records.

**The audit log is append-only.** No row in `audit_logs` is ever updated or deleted. This is intentional. An audit log that can be edited is not really an audit log.

---

## How Permissions Work

There are two layers of permission checks, and both run on every request.

**Layer 1 is the route guard.** The file `proxy.ts` runs before any page loads. It checks if the user is logged in, and if they have the right role to access that route. If not, they get redirected immediately. This is the fast, cheap check.

**Layer 2 is the service layer.** Even after passing the route guard, every service function re-checks the user's role and ownership before touching the database. For example, if an Operator somehow reaches a task detail page for a task not assigned to them, the service function will still block the query.

The reason for two layers is defense in depth. The route guard is convenient but not sufficient on its own. The service layer is the actual enforcement.

Permissions are never calculated from data the client sends. The server always looks up the user from the session and resolves their role from the database directly.

---

## The Task State Machine

Tasks move through four statuses: `PENDING`, `IN_PROGRESS`, `DONE`, and `CANCELLED`.

Not every transition is allowed, and not every role can perform every transition. For example, only an Admin can cancel a task. An Operator can move a task from `PENDING` to `IN_PROGRESS`, but cannot cancel it.

All of this logic lives in one file: `lib/state-machine.ts`. Every part of the codebase that needs to check a transition imports from this file. There are no scattered if/else checks across different routes or components. If the rules need to change, there is exactly one place to change them.

---

## Why Prisma Instead of Supabase RLS

Supabase offers Row Level Security (RLS), which lets you write permission rules directly in the database. It is a valid approach.

The decision here was to handle permissions in the application code instead, using Prisma as the ORM.

The reason is readability. When permission logic lives in database policies, it is harder to read, test, and explain to another developer. When it lives in `services/task.service.ts`, any developer can open that file and immediately understand what is allowed and why. For a prototype where the goal is to demonstrate clear architecture, that transparency matters more than the convenience of RLS.

Supabase is still used for authentication and file storage. Just not for row-level access control.

---

## Error Handling

Service functions never throw errors. They always return a `Result<T>` type, which is either a success with data or a failure with a typed error code.

```ts
type Result<T> =
  | { success: true;  data: T }
  | { success: false; error: AppError }
```

This means every caller is forced to handle both cases. There are no silent failures, no uncaught exceptions, and no guessing about what went wrong. The error codes (`FORBIDDEN`, `NOT_FOUND`, `VALIDATION`, `INTERNAL`) make it clear what category of problem occurred.

---

## File Uploads

Evidence photos are uploaded to a private Supabase Storage bucket. The storage path is saved in the database, but not the URL. Every time a photo is displayed, a fresh signed URL is generated on the server. Signed URLs expire after 24 hours.

This means a leaked URL eventually becomes useless. If the URL had been stored permanently, a leaked link would be a permanent exposure.

---

## What Is Not Here

This prototype does not include a payment system, real-time updates, email notifications, or a mobile app. Those are outside the scope of a test task. The focus was on getting the backend architecture right: clean data model, enforced permissions, reliable audit trail, and maintainable code structure.

---

## Closing

This is a vertical slice, not a finished product. But every structural decision here was made to be defensible and extensible. Adding a new role, a new task status, or a new entity type should not require touching half the codebase. That was the standard used throughout.