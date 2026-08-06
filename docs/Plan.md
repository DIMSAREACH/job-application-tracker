# Plan.md — Job Application Tracker

Implementation plan based on `PRD.md`. Organized into phases so the app is usable early and grows from there.

## Tech stack (from PRD)
- Frontend: React (Vite) + Tailwind CSS + shadcn/ui
- Backend: Next.js API routes
- Database: PostgreSQL via Prisma ORM
- Auth: Auth.js or Supabase Auth (if multi-user)
- Hosting: Vercel (app) + Render (database)

## Phase 0 — Setup
- [ ] Init Next.js project (App Router) with TypeScript
- [ ] Install and configure Tailwind CSS
- [ ] Install shadcn/ui, set up base components (Button, Input, Select, Badge, Dialog)
- [ ] Set up Prisma, connect to a Postgres instance (local Docker for dev)
- [ ] Set up Render Postgres instance for staging/production
- [ ] Push initial repo to GitHub
- [ ] Connect repo to Vercel for auto-deploy on push

## Phase 1 — Data layer
- [ ] Define Prisma schema for `Application` (id, company, position, date_applied, status, interviewed, notes, created_at, updated_at)
- [ ] Run first migration
- [ ] Seed a few sample applications for local dev
- [ ] Build basic API routes: `GET /api/applications`, `POST /api/applications`, `PATCH /api/applications/:id`, `DELETE /api/applications/:id`

## Phase 2 — Core MVP UI
- [ ] Build "Add application" form (company, position, date, status)
- [ ] Build list view of applications with status badges
- [ ] Wire up edit and delete on each entry
- [ ] Build "interviewed" toggle/stamp on each entry, auto-advance status from Applied → Interviewing
- [ ] Build dashboard summary (totals by status, count interviewed)
- [ ] Connect UI to API routes with React Query (loading/error states, optimistic updates)
- [ ] Responsive layout pass (mobile + desktop)

## Phase 3 — Polish and reliability
- [ ] Sorting (by date, company, status)
- [ ] Empty state ("No applications logged yet")
- [ ] Form validation (Zod) on both client and API
- [ ] Basic error handling/toasts for failed requests
- [ ] Manual QA pass across core flows (add, edit, delete, mark interviewed)

## Phase 4 — Auth and multi-user (if in scope for v1)
- [ ] Decide: single-user (no auth) vs multi-user for launch — resolve PRD open question
- [ ] If multi-user: add Auth.js or Supabase Auth, scope applications to logged-in user
- [ ] Migrate schema to include `user_id` on `Application`
- [ ] Update API routes to enforce per-user access

## Phase 5 — Launch
- [ ] Production deploy on Vercel, production DB on Render
- [ ] Environment variables/secrets configured in Vercel dashboard
- [ ] Smoke test production build
- [ ] Share with a few real users for feedback

## Phase 6 — Post-MVP (from PRD "nice-to-have")
- [ ] Notes field per application
- [ ] Filtering by status/company/date range
- [ ] Search across companies/positions
- [ ] Follow-up reminders for stale applications
- [ ] Tags/labels (remote, referral, etc.)
- [ ] CSV import/export
- [ ] Application timeline/history view

## Milestones
| Milestone | Includes |
|---|---|
| M1 — Working local prototype | Phase 0–2, running locally with local Postgres |
| M2 — Deployable MVP | Phase 3, deployed to Vercel + Render |
| M3 — Multi-user launch | Phase 4–5 (if multi-user is in scope) |
| M4 — v2 | Phase 6 features, prioritized by user feedback |

## Open decisions to resolve before Phase 4
- Single-user vs multi-user for v1 (see PRD open questions)
- Whether rejected applications are archived or always visible
- Whether reminders ship in MVP or are deferred
