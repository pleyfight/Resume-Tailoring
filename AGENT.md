# Agent Operating Instructions (Planning, Design, Build)

You are an AI coding agent. Follow these instructions exactly.

## Global Rules
- Read `SEVEN_STEP_STRATEGY.md` before making any changes.
- Keep scope locked to the approved MVP and checklists.
- Prioritize Function + Security before Design + Deployment.
- Use ASCII only in new text unless the file already contains Unicode.
- Prefer deterministic edits: small, explicit changes over large rewrites.
- Update relevant docs when behavior changes (API, setup, or UX).

## Planning Phase (Must Finish Before Design/Build)
Checklist (AI-readable, pass/fail):
- [ ] Confirm target audience and product objective. DONE when: aligned with `SEVEN_STEP_STRATEGY.md`.
- [ ] Confirm MVP scope, supported file types, and auth providers. DONE when: scope is signed off.
- [ ] Confirm deletion/retention policy (15-day undelete). DONE when: policy is documented.
- [ ] Confirm quota model (free limits, monthly, pay-as-you-go). DONE when: limits are documented.
- [ ] Confirm OWASP Top 10 + ASVS L1 acceptance criteria. DONE when: security checklist is approved.
- [ ] Define success metrics (conversion, time-to-first-resume). DONE when: metrics are documented.
- [ ] Define environments (staging + production). DONE when: env plan is documented.

## Design Phase (Only After Planning)
Checklist (AI-readable, pass/fail):
- [ ] Architecture diagram + data flow map. DONE when: diagrams are in docs.
- [ ] API contracts and AI output schema. DONE when: schemas are versioned.
- [ ] UX flows for landing, login, and dashboard. DONE when: wireframes are linked.
- [ ] Drag-and-drop upload UX spec. DONE when: manual area overlay behavior is documented.
- [ ] OAuth flows and account linking rules. DONE when: provider behavior is documented.
- [ ] Storage policy (private bucket + signed URLs). DONE when: policy is approved.

## Build Phase (Only After Design)
Checklist (AI-readable, pass/fail):
- [ ] Implement private storage and signed URL access. DONE when: no public URLs are exposed.
- [ ] Implement deletion flow (soft delete + 15-day restore). DONE when: restore is tested.
- [ ] Implement quotas and rate limits. DONE when: 429 responses are enforced and logged.
- [ ] Implement document extraction for DOC/DOCX/PDF/TXT/PAGES. DONE when: parsed work history is saved.
- [ ] Implement social login (Google, Apple, LinkedIn). DONE when: all providers work in production.
- [ ] Enforce schema validation for all API inputs and AI outputs. DONE when: invalid payloads fail safely.
- [ ] Add audit logging for auth, deletion, generation events. DONE when: logs include user_id and action.

## Testing and Validation
Checklist (AI-readable, pass/fail):
- [ ] Unit tests for schema validation and prompt parsing. DONE when: CI passes.
- [ ] Integration tests for API routes. DONE when: mocks pass for Supabase and Gemini.
- [ ] E2E test for auth -> ingest -> generate -> export. DONE when: Playwright passes on staging.

## Documentation Updates
Checklist (AI-readable, pass/fail):
- [ ] README reflects actual MVP scope. DONE when: docs match behavior.
- [ ] API docs match request/response payloads. DONE when: routes and docs align.
- [ ] Security notes reflect OWASP checklist and data deletion policy. DONE when: docs are updated.

## Non-Negotiables
- Never expose resume files publicly.
- Never store or log tokens, passwords, or PII in logs.
- Never bypass RLS for user-scoped data.
- Stop and ask if requirements conflict.
