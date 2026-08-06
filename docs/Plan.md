# Plan.md — Job Application Tracker

Implementation plan based on `PRD.md`. Organized into phases so the app is usable early and grows from there.

## Tech stack (from PRD)
- Frontend: React + Tailwind CSS + shadcn/ui
- Backend: Next.js API routes & Server Actions
- Database: PostgreSQL (Neon / Render) via Prisma ORM
- Auth: NextAuth Credentials Authentication
- Hosting: Vercel (app) + Neon PostgreSQL (database)

## Phase 0 — Setup
- [x] Init Next.js project (App Router) with TypeScript
- [x] Install and configure Tailwind CSS
- [x] Install shadcn/ui, set up base components (Button, Input, Select, Badge, Dialog)
- [x] Set up Prisma, connect to a Postgres instance (local Docker for dev)
- [x] Set up Render/Neon Postgres instance for staging/production
- [x] Push initial repo to GitHub
- [x] Connect repo to Vercel for auto-deploy on push

## Phase 1 — Data layer
- [x] Define Prisma schema for `Application` (id, company, position, date_applied, status, interviewed, notes, created_at, updated_at)
- [x] Run first migration
- [x] Seed a few sample applications for local dev
- [x] Build basic API routes: `GET /api/applications`, `POST /api/applications`, `PATCH /api/applications/:id`, `DELETE /api/applications/:id`

## Phase 2 — Core MVP UI
- [x] Build "Add application" form (company, position, date, status)
- [x] Build list view of applications with status badges
- [x] Wire up edit and delete on each entry
- [x] Build "interviewed" toggle/stamp on each entry, auto-advance status from Applied → Interviewing
- [x] Build dashboard summary (totals by status, count interviewed)
- [x] Connect UI to API routes with React Query / Server Actions (loading/error states, optimistic updates)
- [x] Responsive layout pass (mobile + desktop)

## Phase 3 — Polish and reliability
- [x] Sorting (by date, company, status)
- [x] Empty state ("No applications logged yet")
- [x] Form validation (Zod) on both client and API
- [x] Basic error handling/toasts for failed requests
- [x] Manual QA pass across core flows (add, edit, delete, mark interviewed)

## Phase 4 — Auth and multi-user (if in scope for v1)
- [x] Decide: single-user (no auth) vs multi-user for launch — resolve PRD open question
- [x] If multi-user: add Auth.js / NextAuth, scope applications to logged-in user
- [x] Migrate schema to include `user_id` on `Application`
- [x] Update API routes to enforce per-user access

## Phase 5 — Launch
- [x] Production deploy on Vercel, production DB on Neon/Render
- [x] Environment variables/secrets configured in Vercel dashboard
- [x] Smoke test production build
- [x] Share with a few real users for feedback

## Phase 6 — Post-MVP (from PRD "nice-to-have")
- [x] Notes field per application
- [x] Filtering by status/company/date range
- [x] Search across companies/positions
- [x] Follow-up reminders for stale applications
- [x] Tags/labels (remote, referral, etc.)
- [x] CSV import/export
- [x] Application timeline/history view

## Milestones
| Milestone | Includes | Status |
|---|---|---|
| M1 — Working local prototype | Phase 0–2, running locally with local Postgres | **100% Completed `[x]`** |
| M2 — Deployable MVP | Phase 3, deployed to Vercel + Render | **100% Completed `[x]`** |
| M3 — Multi-user launch | Phase 4–5 (multi-user enabled) | **100% Completed `[x]`** |
| M4 — v2 | Phase 6 features (Tags, Timeline, CSV, Reminders) | **100% Completed `[x]`** |

## Open decisions resolved
- Multi-user selected with NextAuth Credentials & 1-click Demo Login
- Application cards rendered with Kanban & Table views
- 14-day inactivity reminders implemented with animated alert badges
