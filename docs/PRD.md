# PRD: Job Application Tracker

## 1. Overview

**Product name:** Job Application Tracker (working name)

**Summary:** A web app that helps job seekers track every application they submit — company, position, status, and interview progress — in one place, replacing spreadsheets or sticky notes.

**Problem statement:** People applying to multiple jobs lose track of where they applied, when, what stage each application is at, and whether they've interviewed yet. This leads to missed follow-ups, duplicate applications, and disorganized job searches.

**Goal:** Give users a simple, fast way to log applications and see their job search status at a glance.

## 2. Target users

- Active job seekers applying to multiple roles across companies
- Students/new grads managing high application volume
- Career changers tracking applications across different industries

## 3. Goals and success metrics

| Goal | Metric |
|---|---|
| Users log applications consistently | Avg. applications logged per active user per week |
| Users return to the tool | Weekly active users / 7-day retention |
| Tool reduces missed follow-ups | % of applications with a status update within 14 days |

## 4. Core features (MVP)

### 4.1 Application logging
- Add a new application with: company name, position/title, date applied, status
- Edit or delete an existing application

### 4.2 Status tracking
- Status options: Applied, Interviewing, Offer, Rejected
- Mark an application as "Interviewed" (toggle/stamp), independent of status, to record that a first interview happened

### 4.3 Dashboard / summary view
- Total applications
- Count by status (applied, interviewing, offer, rejected)
- Count of applications interviewed

### 4.4 List view
- All applications shown as a sortable list (by date, company, or status)
- Visual status badges per entry

### 4.5 Persistence
- Data is saved automatically and persists between sessions
- Data is private to the user (not shared/public)

## 5. Nice-to-have features (post-MVP)

- Notes field per application (interviewer name, follow-up details, salary info)
- Reminders/follow-up nudges for applications with no update after N days
- Filtering by status, company, or date range
- Search across companies/positions
- Tags/labels (e.g. "remote", "referral")
- Attach resume/cover letter version used per application
- Multi-device sync via user accounts
- Import from CSV / export to CSV
- Timeline view showing the full history of an application (status changes over time)
- Interview prep notes/checklist tied to an application

## 6. Out of scope (for now)

- Job search / job board integration (pulling listings from LinkedIn, Indeed, etc.)
- Resume builder or cover letter generator
- Team/collaborative tracking (e.g. recruiters managing candidates)
- Native mobile app (web-first, responsive design covers mobile use)

## 7. User flows

**Add an application**
1. User opens the app
2. User fills in company, position, date, status
3. User submits the form
4. New entry appears in the list and the dashboard counts update

**Mark as interviewed**
1. User finds the application in the list
2. User taps/clicks the "interviewed" toggle
3. Entry visually updates (stamp/badge), status auto-advances to "Interviewing" if still "Applied"

**Review job search status**
1. User opens the app
2. User sees dashboard summary (totals by status)
3. User scans the list, sorted by most recent

## 8. Data model (draft)

```
Application
- id
- company (string, required)
- position (string, required)
- date_applied (date)
- status (enum: applied | interviewing | offer | rejected)
- interviewed (boolean)
- notes (string, optional — post-MVP)
- created_at
- updated_at
```

## 9. Non-functional requirements

- **Performance:** List and dashboard should load in under 1 second for up to a few hundred applications
- **Responsiveness:** Usable on both desktop and mobile screen sizes
- **Reliability:** No data loss — every add/edit/delete is persisted immediately
- **Privacy:** User application data is private by default, not visible to other users

## 10. Open questions

- Do we need multi-user accounts/auth for MVP, or is single-user/local storage sufficient for v1?
- Should "Rejected" applications be archived/hidden by default or always shown in the main list?
- What's the right granularity for status (do we need "Offer accepted" / "Offer declined" as separate states)?
- Do we want reminders in MVP or defer entirely to post-MVP?

## 11. Suggested tech stack

- **Frontend:** React (Vite) + Tailwind CSS + shadcn/ui (component library)
- **Backend:** Next.js API routes (or standalone Node/Express)
- **Database:** PostgreSQL via Prisma ORM
- **Auth (if multi-user):** Auth.js or Supabase Auth
- **Hosting:** Vercel (app) + Render (database)
