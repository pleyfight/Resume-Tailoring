# Resume Tailoring (Sleek) — PM Review, Feedback, and Delivery Plan

## Executive Summary

You have a strong MVP shell: a polished marketing landing page, a usable dashboard UI for manual entry + job targeting, Next.js route handlers for ingestion/generation, and a Supabase schema with RLS. The biggest blockers to shipping a real multi-user product are **authentication/session wiring**, **API authorization consistency**, and **upload/generate flow consistency**.

This plan prioritizes (1) making the app *secure and consistent*, (2) making the core workflow *reliable end-to-end* for real users, then (3) adding “product polish” items like resume history, exports, and billing/quotas.

---

## Current State Review

### What’s Working Well
- **Clear UX flow** on `src/app/dashboard/page.tsx`: ingest → paste JD → generate → preview/export.
- **Clean UI system** (consistent palette/typography) and well-structured components in `src/components/`.
- **Supabase database design** includes RLS policies and a `generated_resumes` table (`supabase/migrations/003_generated_resumes.sql`).
- **Gemini integration** exists and returns structured resume JSON (`src/app/api/generate/route.ts`).

### Gaps / Risks (Most Important First)

#### P0 — Auth + Authorization are not implemented end-to-end
- Supabase email/password auth is wired in the UI (`src/app/login/page.tsx`, `src/app/signup/page.tsx`, `src/app/reset-password/page.tsx`, `src/app/update-password/page.tsx`).
- API routes validate Bearer tokens and scope reads/writes to the authenticated user (`src/lib/auth.ts`).
- Frontend calls include Bearer auth headers (`src/app/dashboard/page.tsx`, `src/components/IngestionForm.tsx`).

**Status:** Fixed.

#### P0 — Duplicate / conflicting upload endpoints
- Canonical endpoint: `/api/ingest/document`
- Legacy alias: `/api/ingest/upload` (same behavior)

**Impact:** “Two sources of truth” will create support issues and security gaps.

#### P1 — “Use uploaded documents” does not have real text extraction
- `/api/ingest/document` stores `parsed_text` as `null` (placeholder).
- `/api/generate` in document mode expects `parsed_text`, so it will either fail or provide low-quality output unless placeholders are used.

**Impact:** Feature appears present in UI but is not reliably functional.

#### P1 — Documentation drift / internal inconsistencies
- Docs should stay in sync with `package.json` and the actual API routes.
- Multiple overlapping quickstart docs (`QUICKSTART.md`, `QUICK_START.md`) and references to missing docs.

**Impact:** Setup friction; harder to onboard contributors/users.

#### P2 — Production readiness gaps
- No rate limiting, quota enforcement, or plan entitlements despite UI copy referencing plans/retention.
- Limited observability (no structured logging, error reporting, tracing).
- Upload size/timeouts may not behave as expected on common serverless platforms.

---

## Target Outcome (Definition of Done)

### MVP v1 (“Ship to first users”)
- Users can sign up/log in via Supabase Auth.
- All API endpoints validate the user and scope reads/writes to that user.
- Users can:
  - save a profile (manual entry),
  - generate a tailored resume for a job description,
  - preview and export it (PDF and/or text),
  - view their generated resume history.
- Basic abuse controls (rate limiting + quota counter).
- Staging + Production deployments with repeatable database migrations.

### v1.1 (“Retention + quality”)
- Reliable document ingestion (text extraction + quality checks).
- Better generation determinism (JSON schema / structured outputs).
- Versioned templates and improved export formatting.

---

## Recommended Product/UX Design (Lean)

### Primary User Journeys
1. **Sign up → onboard profile**
2. **Create a new “job target” → generate resume**
3. **Iterate on generation → export**
4. **Return later → reuse profile + history**

### Screen List (Minimum)
- `/` marketing
- `/signup`, `/login`, `/reset-password`
- `/dashboard`
- `/history` (or a history section inside dashboard)
- `/settings` (plan/quota + account)

### UX Notes
- Make “demo mode” explicit if it remains (banner + limited features), otherwise remove it before production.
- If document mode is not implemented, disable the toggle or label it “beta (no extraction yet)”.

---

## Technical Design (Proposed)

### Auth + Session
- Use **Supabase Auth** as the system of record.
- Implement session handling using either:
  - **Supabase SSR helpers** (recommended for Next.js App Router), or
  - a simpler Bearer-token flow for early MVP (works but less ergonomic UX).

### API Authorization Pattern (Standardize)
For every route handler:
1. Extract session/token.
2. Validate user.
3. Use `user.id` for all reads/writes.
4. Avoid service-role bypass for user-scoped reads/writes when possible (prefer RLS enforcement).

### Data Model Enhancements (Minimal)
- Store generated resumes in `generated_resumes` (already migrated).
- Add quota counters/plan fields (tables or `profiles` JSONB), plus server-side enforcement.
- Add `deleted_at`/retention metadata if implementing “free plan auto-delete”.

### Upload Strategy (Production-Safe)
- Prefer **direct-to-Supabase Storage uploads** (signed URL or client upload with RLS policies) to avoid serverless body-size constraints.
- Keep a small server endpoint only for metadata + validation if needed.

---

## Build Plan (Execution Roadmap)

### Phase 0 — Alignment (0.5–1 day)
- Confirm MVP scope, pricing/quotas/retention, and which “demo mode” behaviors to keep.
- Confirm hosting target (Vercel recommended) + environments (staging/prod).

### Phase 1 — Auth + Security Baseline (2–4 days)
- Implement real Supabase sign up/login/reset flows in UI.
- Protect authenticated routes (dashboard/history/settings).
- Update API routes to require user context and remove hard-coded demo IDs.
- Add basic rate limiting (per-user) to `/api/generate`.

**Exit criteria:** No hard-coded user IDs; all reads/writes are scoped to authenticated user.

### Phase 2 — Core Data Flow Hardening (2–4 days)
- Consolidate upload endpoints (choose one canonical route and update UI + docs).
- Ensure manual ingestion is idempotent (upserts where appropriate; delete/replace strategy for arrays).
- Save generated resumes to `generated_resumes` and render a simple history list.

**Exit criteria:** User can return later and see past generated resumes.

### Phase 3 — Document Mode (3–6 days, optional for MVP v1)
- Implement text extraction:
  - PDF: `pdf-parse` or a hosted extraction service
  - DOCX: `mammoth`
  - TXT: direct
- Add extraction success/failure UI and quality checks (min chars, encoding).
- Update generation prompt to include extracted text with boundaries and token budgeting.

**Exit criteria:** “Use documents” consistently improves output and is not brittle.

### Phase 4 — Export + Polish (2–4 days)
- Improve PDF export formatting and ATS-friendliness.
- Add template selection (1–2 templates max).
- Add inline editing for generated output (optional).

### Phase 5 — Production Readiness (2–4 days)
- Observability: error reporting (Sentry), request logging, basic metrics.
- Security review: least-privilege env vars, secret scanning, RLS verification.
- CI: lint + typecheck + tests on PR.

---

## Test Plan

### Automated
- **Unit tests**: prompt builder, JSON parsing, resume formatting utilities.
- **API integration tests**: ingestion + generation (mock Gemini; Supabase test project or mocked client).
- **E2E tests (Playwright)**:
  - sign up → dashboard → manual ingest → generate → export
  - history shows generated resume

### Manual QA (Release Checklist)
- Auth flows (sign up/in/out, reset password)
- RLS validation (user A cannot read user B data)
- Upload happy path + invalid types + oversized payload behavior
- Generation correctness + handling invalid AI output
- Export opens correctly (PDF/text) on Windows/macOS

---

## Documentation Plan (Consolidate + Ship)

### Must-have Docs
- `README.md`: single authoritative setup and run instructions.
- “Architecture & Data Flow” doc with key diagrams.
- “Deployment Runbook”: staging/prod, migrations, env vars, rollback.
- “Security Notes”: what data is stored, retention, key management.

### Cleanup
- Reduce overlap between quickstart files; keep one “Quickstart” and one “Deep setup” doc.
- Ensure endpoints listed match actual UI usage.

---

## Deployment Plan (Staging → Production)

### Recommended Stack
- **Frontend/Next.js**: Vercel (or similar)
- **DB/Storage/Auth**: Supabase
- **Secrets**: Vercel env vars (separate for staging/prod)

### Environments
- **Staging**: separate Supabase project + separate Gemini key/quota.
- **Production**: locked-down Supabase project; least-privilege keys.

### CI/CD
- PR checks: `npm run lint`, `npm run build`, tests.
- Main branch deploys to staging; tagged releases promote to production.

### Database Migrations
- Use Supabase CLI or a documented manual process (but make it consistent).
- Migration order: `001` → `002` → `003`.

### Monitoring & Rollback
- Add error reporting and alerting before inviting real users.
- Rollback plan:
  - application rollback via deploy revert
  - DB rollback via forward-fix migrations (avoid destructive changes without backups)

---

## Immediate Next Actions (48 hours)

1. Decide: keep “demo mode” as a supported mode, or remove it before shipping.
2. Pick the canonical upload endpoint (`/api/ingest/document` recommended) and align UI + docs.
3. Implement Supabase Auth UI and session protection.
4. Remove demo user hard-coding and enforce user scoping in API routes.

---

## Open Questions (Need Your Decisions)

1. Is this intended to be a **multi-tenant SaaS** (real accounts) or a **single-user local tool**?
2. Should document upload be required for MVP v1, or can it be a v1.1 feature?
3. Do you want to enforce the “free plan retention (1 week)” now, or later?
4. Target deployment platform: Vercel, self-hosted, or other?
