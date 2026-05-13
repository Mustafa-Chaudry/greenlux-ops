# GreenLux Ops Codex Context Pack

Use this as the concise grounding file for future Codex tasks. It replaces older phase handovers as the normal first read after `AGENTS.md`.

## Active Repo

`D:\Projects\greenlux-ops`

Older chats may reference missing or stale working directories. Treat this repository as the source of truth.

## Product Doctrine

GreenLux Ops is an internal operations layer for GreenLux Residency, a live serviced-accommodation business. It is not a full PMS, booking engine, channel manager, or accounting platform.

- Do not block operations. Make risk visible and manageable.
- Build for non-technical hotel staff under pressure.
- Prefer admin-controlled workflows over fragile automation.
- Keep room-level operational truth separate from lead booking/group context.
- Staff must be able to recover from imperfect real-world data.
- Guest-facing language should feel premium, calm, human, and hospitality-led.
- Admin language should remain clear, low-stress, and operational.
- Luxury is clarity.

## Current Status

The app is a Next.js App Router + Supabase operations system with public marketing pages, guest check-in, admin guest records, room operations, reporting, folio/additional charges, cleaning readiness, multi-room booking groups, and protected accommodation receipts.

Recent commit history shows current active work through Phase 6.5B plus a recent guest check-in text polish.

## Phase History

### Foundation: Phases 1-5

- Phase 1 - Foundation: Next.js App Router, Supabase setup, auth/session middleware, role-based access, rooms table, 11-unit inventory foundations, database/RLS base.
- Phase 2 - Public Site Shell: public GreenLux pages including homepage, rooms, about, contact, privacy, terms, and marketing surface separate from internal ops.
- Phase 3 - Guest Check-In: guest self-check-in route, guest details form, CNIC/passport/document upload, payment proof upload, Supabase Storage, `guest_checkins` and `guest_documents`.
- Phase 3.5 - Operator UX / Verification: admin-assisted verification, document/payment review states, issue/correction handling, WhatsApp-assisted recovery.
- Phase 4 - Operational Utilities: admin guest records, CSV/export support, expenses, maintenance logs, reporting shell, audit-log patterns where present.
- Phase 5 - Analytics / Reporting / Operational Control: expected vs paid revenue, outstanding balances, booking source breakdown, room performance, new/repeat guest tracking where present, guest folio/additional charges, extend stay workflow, maintenance vs expense separation, occupancy/reporting foundations.

### Current Active Layer: Phase 6+

- Phase 6.1 - Room Reality Board v2: `/admin/occupancy` became the room-level operating board, with per-room status, urgency, payment/ID signals, maintenance, and stay dates with nights.
- Phase 6.2 - Guest Portal Concierge: guest check-in became a clearer concierge-style journey with arrival guide, success state, WhatsApp help, and Wi-Fi request without exposing credentials.
- Phase 6.3 - Cleaning & Turnover Layer: `rooms` gained cleaning/readiness state, manual room controls, inferred turnover, and Room Reality Board cleaning actions. No separate housekeeping table.
- Phase 6.4 - Multi-Room Booking Groups: `booking_groups` added lightweight lead-booking context and nullable `guest_checkins.booking_group_id`. Room/stay records remain separate.
- Phase 6.4C - Multi-Room Finance Guidance: staff guidance warns that room-level expected/paid amounts are per stay; group totals are management reference only.
- Phase 6.5 - Accommodation Receipt: protected admin receipt route at `/admin/guest-records/[id]/receipt`, with browser print/download and WhatsApp-safe sharing.
- Phase 6.5B - Receipt Print/Polish: receipt print CSS fixed, receipt design upgraded for workplace reimbursement, old "Printable guest receipt" language renamed to internal/front-desk summary.
- Recent check-in page polish: guest-facing check-in text was updated to feel clearer and more hospitality-led.

## Architecture Map

- `/admin/occupancy` - Room Reality Board; uses `src/lib/occupancy/snapshot.ts`.
- `/admin/command-centre` - daily action screen; reuses occupancy and reporting sources.
- `/admin/guests/new` - create admin guest stays; supports single-room stays and multi-room booking group attachment/creation.
- `/admin/guest-records/[id]` - room/stay detail, documents, payment, folio/additional charges, room assignment, multi-room context.
- `/admin/guest-records/[id]/receipt` - protected Accommodation Receipt for current stay only.
- `/admin/rooms` - room inventory, operational fields, cleaning readiness controls.
- `/admin/reports` and `/admin/reports/export` - stay-level business reporting and CSV exports.
- `/dashboard/check-in` and `src/components/check-in/check-in-form.tsx` - guest check-in and document/payment upload flow.
- `src/lib/check-in/stay-dates.ts` - stay-date and nights helpers.
- `src/lib/check-in/options.ts` - status, source, payment, room, and label options.
- `src/lib/reports/analytics.ts` - reporting calculations.
- `src/components/admin/print-button.tsx` - browser print helper.
- `scripts/validate-*.mjs` - phase-specific code/logic validators.

## Data Model Map

Key tables:

- `rooms` - 11-unit room inventory, room type/unit labels, maintenance and cleaning/readiness state.
- `guest_checkins` - room/stay-level truth: guest, dates, assigned room, status, expected/paid amounts, source, payment state, notes, `booking_group_id`.
- `guest_documents` - guest ID/payment proof document records and verification state.
- `guest_charges` - folio/additional charges linked to a stay.
- `expenses` - business expense records and private receipt metadata.
- `room_maintenance_logs` - operational maintenance records.
- `audit_logs` - change history where implemented.
- `booking_groups` - lightweight lead booking context for multi-room bookings.

Important reporting/finance rule:

- `guest_checkins` remain revenue truth.
- `booking_groups.expected_total_amount` and `booking_groups.paid_total_amount` are reference fields only.
- Reports remain stay-level unless a future analytics phase explicitly adds grouped allocation logic.
- Do not use booking group totals in revenue, receipt totals, or exports unless that feature is explicitly requested and double-counting is handled.

## Build Protocol For Future Codex Tasks

For normal UI/content tasks:

1. Read `AGENTS.md` and this context pack.
2. Inspect only directly relevant files.
3. Avoid unrelated migrations, assets, reports, auth, and schema files.

Full or broader audits are justified only when the task changes:

- schema, RLS, Storage, auth/session, role access
- reports, CSV export, payments, revenue, folio, receipts
- deployment, recovery, production data handling
- shared operational truth such as occupancy or room assignment

General rules:

- Plan first for complex tasks.
- Prefer existing routes, helpers, validation scripts, and Supabase patterns.
- Do not inspect unrelated migrations unless schema is changing.
- Do not touch unrelated assets.
- Do not stage or commit `scripts/manual-reset-test-operational-data.sql` unless explicitly instructed.
- Do not include new GreenLux image assets unless the task is asset integration.
- Do not add libraries unless clearly necessary.
- Use browser print/save-as-PDF before adding PDF tooling.
- Do not commit automatically.

## Validation Protocol

Standard code checks:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`

Known validators:

- `node scripts/validate-command-centre.mjs`
- `node scripts/validate-room-reality-board.mjs`
- `node scripts/validate-guest-portal-concierge.mjs`
- `node scripts/validate-cleaning-turnover-layer.mjs`
- `node scripts/validate-phase-6-4-multi-room-bookings.mjs`
- `node scripts/validate-phase-6-5-accommodation-receipt.mjs`

When to narrow validation:

- Docs-only changes: run `git diff --check`; no build needed unless source, package, or tooling changed.
- Receipt/print changes: run receipt validator and manually verify Chrome print preview/save-as-PDF.
- Guest portal/check-in changes: run guest portal validator and verify no Wi-Fi password is exposed.
- Room board/cleaning changes: run room reality and cleaning validators.
- Command centre changes: run command centre validator plus reporting/occupancy checks as relevant.
- Schema changes: inspect migrations and `src/types/database.ts`; migration must be applied before code that depends on it is deployed.
- Reporting/payment changes: explicitly review active stay handling, folio/additional charges, expected vs paid revenue, and multi-room double-counting risk.

## Roadmap

- Phase 6.6A - Hospitality Language & Brand Asset Audit
- Phase 6.6 - Command Centre v2
- Phase 6.7 - Guest Record Detail v2
- Phase 6.8 - Cleaner Role + Housekeeping Inspection
- Phase 6.8B - Lost Property Register
- Phase 6.9 - Business Analytics v2 with room-night allocation and average rate/night
- Phase 6.10 - Multi-room booking refinement and combined receipts if needed
- Phase 7.4 - Historical Booking Imports for Airbnb, Booking.com, Agoda

## Normal Task Starting Prompt

Use `docs/codex-context/FUTURE_TASK_TEMPLATE.md` for new work. The key instruction is:

> Read the GreenLux context pack first, then inspect only the files directly relevant to this task. Do not do a full repo audit unless this task changes schema, auth/RLS, reports, payments, role access, or deployment logic.
