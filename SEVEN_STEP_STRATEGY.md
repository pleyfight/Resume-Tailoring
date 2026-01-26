# Seven Step Strategy - Resume Tailoring (Sleek)

## Application Summary (Checklist)
- [ ] Name: Sleek (Resume Tailoring). DONE when: confirmed by product owner.
- [ ] Purpose: help job seekers generate ATS-friendly, tailored resumes from a profile and a target job description. DONE when: aligned to PRD.
- [ ] Target audience: ages 18-50; new grads and experienced workers seeking a job, a new job, or recovering from layoffs. DONE when: approved.
- [ ] Objective: create a resume per job description (JD) to improve interview chances. DONE when: approved.
- [ ] Mission statement: "Deliver a premium, empathetic experience that tailors each resume to the job description and boosts interview confidence." DONE when: approved.
- Core flow today: auth -> ingest profile (manual or upload) -> paste job description -> generate tailored resume -> view/copy/download PDF.
- Tech stack: Next.js App Router (React 19), Tailwind CSS, Supabase (Auth, Postgres, Storage), Google Gemini API, client-side PDF export (jsPDF).

## Codebase Breakdown (What It Is)
- Frontend pages: landing, signup, login, reset-password, update-password, dashboard.
- UI components: IngestionForm (manual or upload), JobTargetInput, ResumeViewer.
- API routes:
  - POST /api/ingest/manual: store profile, work experience, education, skills.
  - POST /api/ingest/document and GET /api/ingest/document: upload and list documents.
  - POST /api/generate: call Gemini, build tailored resume JSON, persist generated resumes.
  - POST /api/ingest/upload: alias of /api/ingest/document.
- Data model (Supabase migrations):
  - profiles, work_experiences, educations, skills
  - uploaded_documents (file URL + parsed text)
  - generated_resumes (AI output JSON + job description)
- Supporting docs: README, QUICKSTART, ENV_SETUP, BACKEND_API_DOCS, TESTING_GUIDE, IMPLEMENTATION_SUMMARY.

## MVP Redesign (Best Practice)
Goal: a secure, reliable, single-user journey with predictable outputs and clear limits.

Recommended MVP scope:
- Must have:
  - Auth: email/password plus social login (Google, Apple, LinkedIn).
  - Route protection for authenticated pages and API routes.
  - Manual profile ingestion with idempotent save (upsert).
  - Tailored resume generation with strict JSON schema and safe parsing.
  - Resume history (last N generations) with view and export.
  - Export to text and PDF (client-side is fine for MVP).
  - OWASP-aligned security baseline (Top 10 + ASVS L1 checklist).
- Should have:
  - Document upload for common resume formats (DOC, DOCX, PDF, TXT).
  - Text extraction for work experience and core profile info.
  - Basic rate limiting and per-user quota enforcement.
  - Error handling and user-visible status for each step.
- Not MVP (push to v1.1):
  - OCR and complex template system.
  - Subscription billing or advanced plan entitlements.

Key best-practice adjustments (checklist):
- [ ] Unify ingestion paths and remove duplicate endpoints in UI and docs. DONE when: one canonical upload route is used everywhere.
- [ ] Avoid public storage for resumes; use private bucket + signed URLs. DONE when: public URLs are not stored or returned.
- [ ] Enforce RLS for all user-scoped reads/writes and avoid service-role bypass. DONE when: all user data is accessed with RLS.
- [ ] Add structured logging and error reporting for API routes. DONE when: logs include route, status, and request ID.
- [ ] Align marketing copy (plans/retention) with real capabilities, or remove claims. DONE when: UI claims match server behavior.
- [ ] Add user data controls: delete all data and account deletion with 15-day undelete. DONE when: soft delete and restore are available.
- [ ] Store all document objects under per-user prefixes and never expose public URLs. DONE when: file paths are private and signed.

## Security Protocol (OWASP-Aligned MVP)
The MVP must meet OWASP Top 10 guidance and a lightweight OWASP ASVS Level 1 checklist.

Checklist (AI-readable, pass/fail):
- [ ] Access control: enforce RLS on all tables; every API route validates the user; no service-role key for user-scoped queries.
  DONE when: all user queries filter by `user_id` and pass auth via `getAuthedSupabase`.
- [ ] Auth and session: Supabase JWT only; if cookies are used, require HttpOnly/SameSite and CSRF protection; if bearer tokens are used, do not use cookies for auth.
  DONE when: auth flow documented and enforced consistently across routes.
- [ ] Social login support: Google, Apple, and LinkedIn available alongside email/password.
  DONE when: users can sign in with all three providers in production.
- [ ] OAuth security (Google/Apple/LinkedIn): strict redirect allowlist, state parameter validation, and PKCE for public clients.
  DONE when: OAuth config passes provider security checks and callback URLs are locked down.
- [ ] Data protection: TLS only; never log PII or tokens; store object paths (not public URLs); private storage + signed URLs.
  DONE when: storage bucket is private and only signed URLs are exposed.
- [ ] Input validation: schema-validate all request bodies and AI outputs; reject invalid payloads.
  DONE when: Zod (or equivalent) guards every API entrypoint and AI parse step.
- [ ] File upload security: allowlist MIME and extension; sanitize file names; enforce size limits; scan for malware when available.
  DONE when: upload route rejects unknown types and oversize files with clear errors.
- [ ] Rate limiting and abuse controls: per-user and per-IP throttles for ingest and generate.
  DONE when: configurable limits return 429 and are logged.
- [ ] Error handling: no stack traces or secrets in responses; consistent error shape.
  DONE when: production errors return safe messages with correlation IDs.
- [ ] Dependency hygiene: lockfile required; routine audits for known vulns.
  DONE when: CI enforces `npm audit` (or equivalent) and fails on high severity.
- [ ] Security headers: HSTS, CSP, X-Content-Type-Options, X-Frame-Options, Referrer-Policy.
  DONE when: headers are set globally in Next.js config.
- [ ] Logging and monitoring: audit events for auth, data deletes, and generation; alert on spikes.
  DONE when: logs include user_id and action (no PII) and alerts are configured.
- [ ] Data lifecycle: soft delete with 15-day restore window; background purge after window closes.
  DONE when: delete flags and restore endpoints are implemented and tested.

## Auth Provider Decisions (MVP)
Checklist (AI-readable, pass/fail):
- [ ] Providers: email/password, Google, Apple, LinkedIn.
  DONE when: all providers are available in production.
- [ ] Provider support: if LinkedIn is not supported natively, implement custom OIDC or a proxy auth service.
  DONE when: LinkedIn login works end-to-end with verified email.
- [ ] Account linking: link accounts by verified email; prevent duplicate user records.
  DONE when: a user can sign in with Google/Apple/LinkedIn and reach the same profile.
- [ ] Email verification: require verified email before enabling write operations.
  DONE when: unverified users are blocked from ingest/generate.
- [ ] Provider metadata: store provider ID, email, and auth method for audit.
  DONE when: audit logs include provider type and user_id.

## Seven Step Strategy and Action Plan (Updated Priorities)

Priority order for this cycle:
- Phase 1: Function + Security
- Phase 2: Design + Deployment

### 1) Plan
Checklist (AI-readable, pass/fail):
- [ ] Confirm MVP scope and success metrics (conversion, time-to-first-resume). DONE when: scope and metrics are signed off.
- [ ] Confirm supported document types for MVP (DOC, DOCX, PDF, TXT). DONE when: types are documented and accepted.
- [ ] Define non-functional requirements: security, privacy, latency, uptime. DONE when: NFRs are documented and prioritized.
- [ ] Define deletion/retention policy and 15-day undelete workflow. DONE when: policy is documented and approved.
- [ ] Define quota model (free limits, monthly plan, pay-as-you-go). DONE when: limits and pricing are documented.
- [ ] Define OWASP Top 10 and ASVS L1 acceptance criteria for the MVP. DONE when: checklist is approved.
- [ ] Confirm auth providers (Google, Apple, LinkedIn) and constraints. DONE when: provider support is validated.
- [ ] Finalize product requirements and user journey. DONE when: PRD and flow are approved.
- [ ] Write acceptance criteria for each MVP feature. DONE when: each feature has pass/fail criteria.
- [ ] Establish staging vs production environments. DONE when: environments are named and configured.

### 2) Design
Checklist (AI-readable, pass/fail):
- [ ] Create architecture diagram and data flow map. DONE when: diagrams are in the docs folder.
- [ ] Define data contracts for API payloads and AI output schema. DONE when: schemas are versioned.
- [ ] Produce UI wireframes for dashboard, history, and error states. DONE when: wireframes are linked.
- [ ] Standardize API auth and response shapes. DONE when: all routes follow one response contract.
- [ ] Specify resume JSON schema and validation rules. DONE when: schema is codified and enforced.
- [ ] Decide storage policy (private bucket + signed URLs). DONE when: policy is documented and approved.
- [ ] Define deletion UX (delete all data, delete account, 15-day restore). DONE when: UX flow is documented.
- [ ] Define drag-and-drop UX for upload over manual panel. DONE when: behavior is documented.
- [ ] Define OAuth flows and account-linking rules (email + social). DONE when: rules are documented.

### 3) Build
Checklist (AI-readable, pass/fail):
- [ ] End-to-end flow works with persisted data and history. DONE when: a user can ingest, generate, and view history.
- [ ] API routes enforce consistent auth and error handling. DONE when: all routes share auth middleware pattern.
- [ ] Prompt + parsing logic is resilient. DONE when: invalid AI outputs are rejected or repaired.
- [ ] Add resume history page or dashboard section. DONE when: history list renders and loads from DB.
- [ ] Manual ingest is idempotent (upsert + replace). DONE when: repeated saves do not create duplicates.
- [ ] Structured output validation + fallback parsing is implemented. DONE when: schema validation blocks bad JSON.
- [ ] Document extraction for DOC/DOCX/PDF/TXT; map to work experience. DONE when: parsed work experience is stored.
- [ ] Rate limiting + per-user quotas (free tier, monthly, pay-as-you-go). DONE when: limits return 429 and log events.
- [ ] Delete-all and delete-account with 15-day undelete (soft delete). DONE when: soft delete and restore are tested.
- [ ] Remove demo-mode shortcuts for production builds. DONE when: demo-only code paths are gated.
- [ ] OAuth login for Google, Apple, and LinkedIn. DONE when: all providers work in production.

### 4) Test
Checklist (AI-readable, pass/fail):
- [ ] Automated test coverage for core flows. DONE when: CI runs unit + integration suites.
- [ ] E2E test for auth -> ingest -> generate -> export. DONE when: Playwright passes on staging.
- [ ] Unit tests for prompt builder, JSON parser/validator, export helpers. DONE when: tests cover success/failure paths.
- [ ] Integration tests for API routes with mocked Supabase and Gemini. DONE when: routes pass mocks.
- [ ] Tests for soft-delete, restore window, and quota enforcement. DONE when: edge cases are covered.

### 5) Document
Checklist (AI-readable, pass/fail):
- [ ] Single source of truth for setup and operations. DONE when: one primary quickstart exists.
- [ ] API contract docs aligned with code. DONE when: docs match route inputs/outputs.
- [ ] Consolidate QUICKSTART files into one guide. DONE when: duplicates are removed.
- [ ] Update README with accurate MVP scope and limitations. DONE when: claims match features.
- [ ] Add deployment runbook with env vars and migration steps. DONE when: runbook is complete.
- [ ] Add security notes for storage privacy and deletion policy. DONE when: security notes are published.

### 6) Deploy
Checklist (AI-readable, pass/fail):
- [ ] Staging and production environments with CI. DONE when: CI deploys to staging and tags to prod.
- [ ] Repeatable database migration workflow. DONE when: migrations run in order without manual edits.
- [ ] Configure Supabase projects for staging/prod. DONE when: both projects are set up.
- [ ] Set environment variables in the deployment platform. DONE when: envs are present and validated.
- [ ] Add CI steps: lint, build, tests. DONE when: CI fails on errors.
- [ ] Enable basic monitoring (Sentry or similar). DONE when: errors appear in dashboard.
- [ ] Verify storage bucket is private and signed URL access is enforced. DONE when: public access is blocked.

### 7) Maintain
Checklist (AI-readable, pass/fail):
- [ ] Operational playbook and backlog governance. DONE when: support process and owners are defined.
- [ ] Clear support and data-retention policy. DONE when: policy is published.
- [ ] Bug triage and release cadence. DONE when: schedule is documented and followed.
- [ ] Monitor usage, costs, and AI token limits. DONE when: dashboards are active.
- [ ] Plan v1.1 roadmap (document extraction, templates, billing). DONE when: roadmap is approved.
- [ ] Review delete/undelete metrics and time-to-restore SLAs. DONE when: SLA is tracked.

## Immediate Next Actions (Short List)
Checklist (AI-readable, pass/fail):
- [ ] Lock MVP requirements for document extraction and supported file types. DONE when: requirements are signed off.
- [ ] Implement private storage + signed URLs and remove public access. DONE when: public access is blocked.
- [ ] Add delete-all and delete-account with 15-day undelete. DONE when: soft delete and restore work.
- [ ] Add schema validation for AI output and enforce quotas. DONE when: invalid output is rejected.
- [ ] Align docs and marketing claims with actual features. DONE when: docs match shipping scope.
- [ ] Confirm OAuth provider support for LinkedIn (Supabase vs custom OIDC). DONE when: integration path is approved.
