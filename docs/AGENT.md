# AGENT.md — AI Agent Guidance & Execution Protocol

This document defines the operating rules, technical standards, development workflow, and execution guidelines for AI coding agents working on the **Job Application Tracker** project.

---

## 1. Project Overview & Context

- **Project Name:** Job Application Tracker
- **Description:** Full-stack web application enabling job seekers to track applications across status stages (Applied, Interviewing, Offer, Rejected) via a dual Kanban board and interactive table view.
- **Tech Stack:**
  - **Framework:** Next.js 14+ (App Router, TypeScript)
  - **Styling & Components:** Tailwind CSS, shadcn/ui, Lucide Icons, `@hello-pangea/dnd` / `dnd-kit`
  - **Database & ORM:** PostgreSQL, Prisma ORM
  - **Authentication:** Auth.js (NextAuth.js v5)
  - **Validation & Forms:** Zod, React Hook Form

---

## 2. Agent Autonomy & Execution Protocol

### 2.1 Autonomy Level
The AI agent is granted **Full Autonomy** to:
- Run terminal commands (`npm install`, `npx prisma migrate dev`, `npm run dev`, `npx tsc`).
- Create and edit source files in the workspace.
- Check off completed items in [`docs/Task.md`](file:///d:/Year4/S2/Build%20Own%20Project/Job%20Application%20Tracker/docs/Task.md).

### 2.2 Verification Rule (Mandatory)
Before claiming a task is finished or checking off an item in [`docs/Task.md`](file:///d:/Year4/S2/Build%20Own%20Project/Job%20Application%20Tracker/docs/Task.md), the agent **MUST**:
1. Run type-checking (`npx tsc --noEmit`) and fix any compilation or type errors.
2. Confirm the code builds or dev server runs cleanly without runtime errors.
3. Validate that existing functionality is preserved.

### 2.3 Task Execution Cycle
```mermaid
flowchart LR
    ReadTask["1. Read Task.md"] --> CheckDesign["2. Cross-reference Design.md & PRD.md"]
    CheckDesign --> Implement["3. Implement Code Changes"]
    Implement --> Verify["4. Run Verification (tsc / build)"]
    Verify --> UpdateTask["5. Mark Task Complete in Task.md"]
```

---

## 3. Local Development & Database Workflow

- **Local DB Service:** Local PostgreSQL instance running via Docker (`docker-compose.yml`).
- **Connection String:** Configured in `.env.local`:
  ```env
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/job_tracker?schema=public"
  ```
- **Prisma Migrations Protocol:**
  - Modify database models in `prisma/schema.prisma`.
  - Execute non-destructive development migrations using:
    ```bash
    npx prisma migrate dev --name <descriptive_migration_name>
    ```
  - Use `npx prisma db seed` for populating dev sample data.
  - **CAUTION:** Never execute destructive commands like `prisma migrate reset` or `DROP TABLE` without explicit user prompt or backup.

---

## 4. Coding Standards & Conventions

### 4.1 TypeScript & React Server Components (RSC)
- Strict mode is enabled. Do NOT use `any` types.
- Default to React Server Components (RSC) for page layouts and server data fetching.
- Add `'use client';` directive strictly to interactive client components (e.g. Kanban board, modals, search inputs, dropdown menus).

### 4.2 Server Actions & Data Access
- Place Server Actions in the `actions/` directory (e.g., `actions/application-actions.ts`).
- Mark server action files with `'use server';`.
- Always validate incoming payload using Zod schemas.
- Enforce user data isolation in every Prisma call:
  ```typescript
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const applications = await prisma.application.findMany({
    where: { userId: session.user.id }
  });
  ```

### 4.3 UI & Styling Guidelines
- Maintain a cohesive dark mode aesthetic with high visual contrast.
- Use exact status styling from [`docs/Design.md`](file:///d:/Year4/S2/Build%20Own%20Project/Job%20Application%20Tracker/docs/Design.md):
  - **APPLIED:** Indigo badge (`bg-indigo-500/10 text-indigo-400 border-indigo-500/20`)
  - **INTERVIEWING:** Amber badge (`bg-amber-500/10 text-amber-400 border-amber-500/20`)
  - **OFFER:** Emerald badge (`bg-emerald-500/10 text-emerald-400 border-emerald-500/20`)
  - **REJECTED:** Rose badge (`bg-rose-500/10 text-rose-400 border-rose-500/20`)
  - **INTERVIEWED STAMP:** Purple badge (`🎙️ Interviewed`).

---

## 5. Documentation Directory

Refer to the following project documents for specification details:

- [PRD.md](file:///d:/Year4/S2/Build%20Own%20Project/Job%20Application%20Tracker/docs/PRD.md) — Product requirements, user flows, and MVP goals.
- [Plan.md](file:///d:/Year4/S2/Build%20Own%20Project/Job%20Application%20Tracker/docs/Plan.md) — Phase-by-phase implementation plan.
- [Task.md](file:///d:/Year4/S2/Build%20Own%20Project/Job%20Application%20Tracker/docs/Task.md) — Actionable task checklist.
- [Design.md](file:///d:/Year4/S2/Build%20Own%20Project/Job%20Application%20Tracker/docs/Design.md) — System architecture, ERD schema, UI specs, and API contracts.
