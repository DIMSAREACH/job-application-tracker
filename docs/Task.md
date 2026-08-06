# Task.md — Job Application Tracker

Granular, actionable tasks derived from `Plan.md`. Check items off as you complete them. Grouped by phase; within each phase, roughly in the order you'd do them.

---

## Phase 0 — Setup

- [x] Create GitHub repo `job-application-tracker`
- [x] Run `npx create-next-app@latest` with TypeScript, App Router, Tailwind enabled
- [x] Verify dev server runs (`npm run dev`)
- [x] Install shadcn/ui: `npx shadcn@latest init`
- [x] Add base components: `button`, `input`, `select`, `badge`, `dialog`, `card`
- [x] Install Prisma: `npm install prisma --save-dev` and `npx prisma init`
- [x] Spin up local Postgres via Docker (`docker-compose.yml` with a `postgres` service)
- [x] Set `DATABASE_URL` in `.env.local` pointing to local Docker DB
- [x] Create Render account, provision a Postgres instance for staging/prod
- [x] Store Render `DATABASE_URL` as a Vercel environment variable (later, in Phase 5)
- [x] Push initial commit to GitHub
- [x] Create Vercel project, link to GitHub repo, confirm auto-deploy on push works with a placeholder page

## Phase 1 — Data layer

- [x] Write `Application` model in `schema.prisma`:
  - `id` (uuid, primary key)
  - `company` (string, required)
  - `position` (string, required)
  - `date_applied` (date)
  - `status` (enum: `applied`, `interviewing`, `offer`, `rejected`)
  - `interviewed` (boolean, default false)
  - `notes` (string, optional)
  - `created_at` / `updated_at` (timestamps)
- [x] Run `npx prisma migrate dev --name init`
- [x] Write a seed script (`prisma/seed.ts`) with 5–10 sample applications
- [x] Run seed script, confirm data in local DB (via `npx prisma studio`)
- [x] Build `GET /api/applications` — return all applications
- [x] Build `POST /api/applications` — create a new application
- [x] Build `PATCH /api/applications/[id]` — update fields (status, interviewed, notes, etc.)
- [x] Build `DELETE /api/applications/[id]` — remove an application
- [x] Test all four routes manually (curl, Postman, or Thunder Client)

## Phase 2 — Core MVP UI

- [x] Build page layout/shell (header, container)
- [x] Build "Add application" form component (company, position, date, status)
- [x] Wire form submit to `POST /api/applications`
- [x] Build application list component, rendering each entry as a card/row (Kanban + Table)
- [x] Add status badge styling per status value (applied/interviewing/offer/rejected)
- [x] Add edit action per entry (inline edit or dialog with the add-form fields pre-filled)
- [x] Wire edit action to `PATCH /api/applications/[id]`
- [x] Add delete action per entry with a confirm step
- [x] Wire delete action to `DELETE /api/applications/[id]`
- [x] Build "interviewed" toggle/stamp UI per entry
- [x] Wire toggle to `PATCH`, and auto-set status to `interviewing` if current status is `applied`
- [x] Build dashboard summary component (total, count per status, count interviewed)
- [x] Compute dashboard values from fetched application list
- [x] Configure data fetching and state management
- [x] Add optimistic update for drag & drop and interviewed toggle (instant UI feedback)
- [x] Responsive pass: test list, form, and dashboard at mobile width (~375px)

## Phase 3 — Polish and reliability

- [x] Add sort control (date / company / status) to list view
- [x] Implement sort logic (client-side is fine for MVP scale)
- [x] Build empty state ("No applications logged yet" + CTA to add one)
- [x] Add Zod schema for application input, share between client form and API route
- [x] Add client-side validation messages on the add/edit form
- [x] Add server-side validation on API routes, return clear error responses
- [x] Add status feedback & error handling for operations
- [x] Manual QA: add an application end-to-end
- [x] Manual QA: edit an application end-to-end
- [x] Manual QA: delete an application end-to-end
- [x] Manual QA: mark interviewed and confirm status auto-advances
- [x] Manual QA: refresh page and confirm data persists

## Phase 4 — Auth and multi-user (only if in scope for v1)

- [x] Decide single-user vs multi-user for launch (Multi-user selected)
- [x] Install Auth.js / NextAuth with Credentials authentication
- [x] Add sign-up/sign-in pages (`/login` and `/register` + instant 1-click demo login)
- [x] Add `userId` field to `Application` model, run migration
- [x] Scope all API routes and Server Actions to the authenticated user's `userId`
- [x] Add route protection (`middleware.ts` redirects unauthenticated users to `/login`)
- [x] Test that one user cannot see or modify another user's applications

## Phase 5 — Launch

- [x] Set production `DATABASE_URL` (Render) in Vercel project settings
- [x] Run production migration against Render DB
- [x] Trigger production deploy on Vercel
- [x] Smoke test production: add, edit, delete, mark interviewed
- [x] Confirm data persists after a production page refresh
- [x] Share the live link with 2–3 real users for feedback
- [x] Collect and log feedback for the Phase 6 backlog

## Phase 6 — Post-MVP backlog (prioritize after launch feedback)

- [x] Add `notes` field UI (already in schema) — textarea per application
- [x] Add filter controls (by status, company, date range)
- [x] Add search input across company/position
- [x] Design and implement follow-up reminder logic (e.g. flag applications untouched 14+ days)
- [x] Add tags/labels field and UI (remote, referral, etc.)
- [x] Build CSV export
- [x] Build CSV import
- [x] Build per-application timeline/history view (status change log)

---

## Quick reference — open decisions blocking later tasks
- Single-user vs multi-user (blocks Phase 4)
- Rejected applications: archived or always visible (affects Phase 2 list view)
- Reminders in MVP or deferred (affects Phase 3 vs Phase 6 placement)
