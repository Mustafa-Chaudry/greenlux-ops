# GreenLux Ops Agent Instructions

GreenLux Ops is a live serviced-accommodation operations system. Work like a senior full-stack engineer who understands front desk pressure, guest data sensitivity, and revenue accountability.

## Read First

- For normal tasks, read this file and `docs/codex-context/CODEX_HANDOVER.md`, then inspect only files directly relevant to the task.
- Pilot repo-local skill: `.codex/skills/greenlux-task-runner/SKILL.md`.
- Do not perform a full repo audit unless the task changes schema, auth/RLS, reports, payments, financial calculations, role access, deployment, or production recovery logic.
- For complex tasks, plan first: state the operational need, likely files, validation path, and risks before editing.

## GreenLux Doctrine

- Do not block operations. Make risk visible and manageable.
- Build for non-technical hotel staff under pressure.
- Prefer admin-controlled workflows over fragile automation.
- Keep room-level operational truth separate from lead booking or group context.
- Avoid premature booking engines, channel managers, AI agents, or heavy integrations.
- Staff must be able to recover from imperfect real-world data.
- Guest-facing language should feel premium, calm, human, and hospitality-led.
- Admin language should stay clear, low-stress, and operational.
- Luxury is clarity.

## Repo Structure

- `src/app/admin/occupancy` - Room Reality Board and room-level operational visibility.
- `src/app/admin/command-centre` - daily operations command centre.
- `src/app/admin/guests/new` - admin-created guest stays, including multi-room booking attachment.
- `src/app/admin/guest-records/[id]` - guest/stay detail, documents, payments, folio, room assignment.
- `src/app/admin/guest-records/[id]/receipt` - protected Accommodation Receipt.
- `src/app/admin/reports` and `src/lib/reports/analytics.ts` - owner reporting and CSV exports.
- `src/lib/occupancy/snapshot.ts` - occupancy/cleaning/readiness snapshot source.
- `src/components/check-in/check-in-form.tsx` - guest check-in form.
- `supabase/migrations` - schema, RLS, Storage, and operational data model changes.
- `scripts/validate-*.mjs` - phase-specific safety validators.

## Setup And Commands

- Package manager declared in `package.json`: `pnpm@10.33.2`.
- Local dev server: `npm run dev`.
- Production build: `npm run build`.
- Production start after build: `npm run start`.
- TypeScript check: `npm run typecheck`.
- Lint: `npm run lint`.
- There is no general test script; use the targeted `node scripts/validate-*.mjs` validators listed below.

## Data And Finance Rules

- `guest_checkins` remain the room/stay-level source of truth.
- `booking_groups` are lead booking context only. Do not use group totals as revenue truth unless a future grouped reporting/receipt feature explicitly implements that.
- Reports currently remain stay-level. Do not double-count multi-room bookings.
- Keep cleaning, maintenance, room readiness, documents, payments, and folio/additional charges per room/stay unless a task explicitly changes that model.
- Do not expose guest identity, documents, payment proof, or private receipt URLs to cleaner/guest surfaces without explicit access control.

## Do Not Touch Unless Asked

- Do not change production data or credentials from this repo.
- Do not stage or commit `scripts/manual-reset-test-operational-data.sql` unless explicitly instructed.
- Do not include or alter new GreenLux image assets unless the task is asset integration.
- Do not add dependencies unless clearly necessary and approved by the task.
- Do not add a PDF library while browser print/save-as-PDF is sufficient.
- Do not call receipts "Tax Invoice" unless verified tax registration details are intentionally added.
- Do not commit or push automatically. Commit only when explicitly instructed.

## Build And Validation

Standard checks for code changes:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Run targeted validators when relevant:

- `node scripts/validate-room-reality-board.mjs`
- `node scripts/validate-command-centre.mjs`
- `node scripts/validate-guest-portal-concierge.mjs`
- `node scripts/validate-cleaning-turnover-layer.mjs`
- `node scripts/validate-phase-6-4-multi-room-bookings.mjs`
- `node scripts/validate-phase-6-5-accommodation-receipt.mjs`

Docs-only changes normally require only `git diff --check` unless package/tooling/source behavior changed.

Manual checks:

- Receipt/print changes require Chrome print-preview/save-as-PDF verification.
- Guest portal/check-in changes must verify no Wi-Fi password is exposed.
- Schema changes require migration review and application before deploying code that depends on the new schema.
- Financial/reporting changes require explicit double-counting review.

## Commit Hygiene

- Keep commits phase-specific and avoid mixing unrelated files.
- Stage only the requested files when a task names an exact stage list.
- Preserve unrelated user or generated changes in the working tree.
- Before committing, show or confirm `git status --short` when useful.

## Done Means

- The requested workflow is handled end to end or the blocker is clearly reported.
- Relevant validations have run and results are stated.
- Operational impact, risks, manual verification steps, and any deployment/migration needs are clear.

## Required Response Shape For Implementation Work

1. What changed
2. Why it is needed operationally
3. Files impacted
4. Exact content, logic, or code approach
5. Risks
6. Manual verification steps
