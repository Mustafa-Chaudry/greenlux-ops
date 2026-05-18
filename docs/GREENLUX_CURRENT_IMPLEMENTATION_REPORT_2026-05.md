# GreenLux Ops Current Implementation Report — May 2026

## 1. Executive Summary

GreenLux Ops is a production MVP internal operations platform for GreenLux Residency, a live serviced-accommodation business. It turns fragmented operational work - WhatsApp coordination, spreadsheets, ad-hoc guest records, payment follow-up, document chasing, room handovers, and owner reporting - into a structured, role-aware, auditable operating layer.

The product is designed around a practical hospitality principle: do not block operations; make risk visible and manageable. Staff can keep serving guests even when real-world data is incomplete, while the system surfaces risks such as missing ID, pending Payment Confirmation, Balance Due, room readiness, maintenance, and correction needs.

GreenLux Ops is intentionally not a full PMS, booking engine, channel manager, tax/accounting product, or WhatsApp automation system. It is an operational intelligence system for a boutique serviced-accommodation environment where non-technical staff need clarity, speed, and recovery options.

## 2. Current Repo Status

Repository branch at audit time: `main`, tracking `origin/main`.

Latest relevant commits:

- `f4e326a` - `docs: refresh README for Phase 7.0`
- `7579289` - `feat: add super admin correction console`
- `4bff90a` - `feat: upgrade business analytics dashboard`
- `0d5d703` - `feat: add lead booking workspace`
- `c9eb734` - `feat: improve front desk repeat guest workflow`
- `8de0406` - `feat: add front desk repeat guest intelligence`
- `1205ab3` - `feat: refine guest stay detail workspace`
- `c96346e` - `feat: upgrade command centre daily ops view`
- `0255c80` - `feat: add Phase 6.1 room reality board`

README status: `README.md` reflects `Production MVP - Phase 7.0` and describes the current platform, including the Super Admin Correction Console, Business Analytics v2, Lead Booking workflow, Room Reality Board, Command Centre, receipts, validation commands, deployment URLs, and known limitations. One presentation caveat from the audit: some README headings displayed character-encoding artifacts in the local checkout, while the substantive content remained current.

Current untracked files at audit time:

- `public/greenlux/booking/GLR High res Logo.png`
- `scripts/manual-reset-test-operational-data.sql`

The manual reset SQL file is operationally sensitive and should not be committed, staged, copied into reports, or shared unless explicitly requested for a controlled maintenance task.

Validation status from the current-state audit:

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm run build` passed.
- `git diff --check` passed.
- Phase 7.0 validator passed.
- Most targeted feature validators passed.
- `scripts/validate-guest-portal-concierge.mjs` failed because of stale wording-pattern assertions after later hospitality-language updates. The current guest portal still uses a Wi-Fi request flow and does not expose Wi-Fi credentials.

## 3. Live Product Status

The app is documented as deployed at `https://greenlux-ops.vercel.app/admin`. A live access check during the audit showed protected app routes responding on Vercel and redirecting unauthenticated users to sign-in, which matches the expected protected-app behavior.

The public marketing website is documented at `https://greenluxresidency.com` and was reachable during the audit.

Primary user groups:

- Managers/admins: daily operations, guest stays, occupancy, room readiness, maintenance, document review, payment follow-up, and staff workflows.
- Super admins: correction/recovery, business analytics, expenses, users, and financial/operational oversight.
- Guests: authenticated arrival/check-in flow for stay details, ID upload, payment confirmation upload, and arrival guide access.

Current operational modules:

- Public website and room marketing.
- Guest check-in and arrival-details flow.
- Document and payment upload.
- Admin dashboard.
- Command Centre.
- Room Reality Board.
- Guest Stay workspace.
- Lead Booking / multi-room context.
- Accommodation receipts.
- Business Analytics v2 and CSV export.
- Expenses.
- Maintenance.
- Cleaning/turnover readiness.
- Super Admin Correction Console.

## 4. Feature Timeline

Phase 1 - Foundation:

- Next.js App Router application structure.
- Supabase Auth, Postgres, Storage, and Row Level Security foundations.
- Role model for `guest`, `manager`, `admin`, and `super_admin`.
- Core tables for users, rooms, guest check-ins, guest documents, expenses, room maintenance logs, and audit logs.

Phase 2 - Public Website:

- Public GreenLux website pages including homepage, room pages, about, contact, guides/location, privacy, and terms.
- Separation between public marketing surfaces and internal operational routes.

Phase 3 - Guest Check-In:

- Guest-facing check-in/arrival details flow.
- CNIC/passport/document upload.
- Payment Confirmation upload.
- Storage-backed document records linked to Guest Stays.

Phase 3.5/4 - Admin Verification, Recovery, Exports, Maintenance, Expenses:

- Admin verification and document review patterns.
- Controlled override/document recovery foundations.
- Guest records, CSV/export support, operational maintenance, business expenses, and audit-log usage.

Phase 5 - Analytics and Reporting:

- Reporting foundations for expected revenue, paid revenue, outstanding balance, booking source, room performance, expenses, and operational control.
- Guest folio/additional charges and extend stay workflows.
- Unit-based inventory and occupancy intelligence.

Phase 6.1 - Room Reality Board:

- `/admin/occupancy` became the room-level operational board.
- Staff can see occupied, vacant, due-out, upcoming, needs-attention, maintenance, payment, ID, and readiness signals per unit.

Phase 6.2 - Concierge-Style Guest Portal:

- Guest check-in was upgraded into a calmer arrival journey.
- Includes arrival guide, review status, WhatsApp help, and Wi-Fi request without exposing credentials.

Phase 6.3 - Cleaning/Turnover Readiness:

- Cleaning/readiness state was modeled on `rooms`.
- Room Reality Board displays manual and inferred turnover signals.
- Readiness warnings support operations without blocking all recovery actions.

Phase 6.4 - Lead Booking / Multi-Room Booking Groups:

- `booking_groups` added responsible booker / lead booking context.
- Individual Guest Stays remain room/stay-level operational and financial truth.
- Reports avoid double-counting by not using Lead Booking totals as revenue truth.

Phase 6.5 - Protected Accommodation Receipt:

- Protected admin receipt route at `/admin/guest-records/[id]/receipt`.
- Browser print/save-as-PDF workflow.
- Stay-level receipt design for accommodation records and workplace reimbursement.

Phase 6.6-6.8A - Command Centre, Guest Stay Detail, Repeat Guest Intelligence, Front-Desk Support:

- Daily Command Centre upgraded into an action-first manager screen.
- Guest Stay detail page refined into an operational workspace.
- Repeat guest intelligence and safe autofill added.
- Front-desk document handling expanded, including supporting documents and camera-friendly uploads.

Phase 7.0 - Super Admin Correction Console:

- Super-admin-only correction/recovery workflow added inside the Guest Stay workspace.
- Corrections require reasons, capture field-level old/new values, and write audit metadata.

## 5. Phase 7.0 Detail

Problem solved:

Real hotel operations produce data mistakes: wrong room, wrong dates, wrong payment amount, wrong guest count, wrong booking source, or wrong Lead Booking context. Before Phase 7.0, these mistakes risked either silent database edits or operational confusion.

Operator value:

Phase 7.0 gives authorized super admins a controlled recovery workflow inside the platform. It keeps operations moving while making correction risk visible and auditable.

Super-admin-only boundary:

- The UI is shown only when the profile role is `super_admin`.
- The save action requires `superAdminRoles`.
- Manager/admin access remains constrained to normal operational actions.

Controlled correction fields:

- Guest identity and contact fields.
- Stay dates.
- Assigned room.
- Booking source.
- Guest count.
- Stay status.
- Payment status and method.
- Agreed room rate.
- Total expected amount.
- Amount paid.
- ID Verification and Payment Confirmation flags.
- Internal notes.
- Lead Booking context.

Correction reason and optional note:

- A correction reason is required.
- An optional correction note can add human context.
- If reason is `other`, a note is required by validation.

Old/new diff and audit metadata:

- The action computes changed fields.
- Old and new values are serialized into audit metadata.
- Metadata includes correction reason, optional note, changed fields, financial correction flag, room-overlap warning, and Lead Booking context-only marker.

Room-overlap warning capture:

- Date/room corrections use existing room assignment conflict detection.
- The workflow records an overlap warning in audit metadata and returns a visible staff message instead of silently hiding the risk.

Files/routes/actions changed:

- `src/app/admin/guest-records/[id]/page.tsx` - Correction Console UI inside the Guest Stay workspace.
- `src/app/admin/guest-records/actions.ts` - `saveSuperAdminGuestCorrection` action, validation, diffing, audit insert, update, revalidation, and redirect message.
- `scripts/validate-super-admin-corrections.mjs` - targeted validator for Phase 7.0 behavior.
- Route impacted: `/admin/guest-records/[id]`.

Schema/migration impact:

- No new Phase 7.0 migration was required.
- The implementation uses existing `guest_checkins`, `booking_groups`, `audit_logs`, roles, and room conflict helpers.

Validation performed:

- `node scripts/validate-super-admin-corrections.mjs` passed.
- TypeScript, lint, and production build passed in the current-state audit.

Limitations/next steps:

- There is no separate audit-log viewer summarized in this report.
- Correction history is stored in `audit_logs`, but a dedicated super-admin correction history UI could improve reviewability.
- Manual browser verification of correction flows should be repeated after any future schema or Guest Stay workspace change.

## 6. Current Feature Map

Public website / room marketing:

- Public pages present the property, rooms, location, contact, and supporting information.
- Marketing is separate from protected internal operations.

Guest check-in:

- Authenticated `/dashboard/check-in` flow collects arrival details, guest details, dates, purpose, booking source, and requests.
- The journey is styled as a concierge-style arrival workflow rather than a cold system form.

Document/payment upload:

- Primary guest ID/passport upload.
- Additional guest document upload.
- Supporting document upload.
- Payment Confirmation upload when relevant.
- Camera-friendly inputs where supported by browser/device.

Document recovery/correction workflows:

- Admin-facing document review and status workflows exist.
- Supporting documents and repeat guest document reuse are supported where appropriate.
- Previous payment proof is intentionally not reused because payment confirmation is stay-specific.

Admin dashboard:

- Protected admin entry point for management users.
- Links core operational modules and summarizes current operational state.

Command Centre:

- Daily manager screen for arrivals, departures, cleaning, readiness, maintenance, Balance Due, pending ID/payment, and multi-room attention.
- Uses existing occupancy and reporting truth rather than inventing a separate workflow.

Room Reality Board:

- 11-unit room-level board at `/admin/occupancy`.
- Shows room status, readiness, cleaning state, maintenance, payment/ID signals, current/upcoming stay, and urgency.

Guest Stay workspace:

- Operational control panel for an individual room stay.
- Includes summary, priority alerts, stay details, payments, documents, charges, WhatsApp actions, receipts, repeat guest/history context, admin actions, and super-admin correction where authorized.

Lead Booking / multi-room context:

- Lead Booking represents the responsible booker/payment coordination context.
- Guest Stays remain individual room/stay records.
- Linked rooms can differ by dates, rates, guests, readiness, documents, and payments.

Receipts:

- Protected stay-level Accommodation Receipt route.
- Browser print/save-as-PDF workflow.
- Includes stay details, room, nights, charges, amount paid, Balance Due, and payment context.
- Does not present itself as a Tax Invoice.

Business Analytics v2 / CSV exports:

- Super-admin business analytics with daily, weekly, monthly, and custom periods.
- Room-night overlap allocation.
- Expected revenue, Paid Revenue Recorded, Balance Due, expenses, net profit, occupancy, average rate/night, booking source, unit performance, daily performance, and attention lists.
- CSV export support.

Expenses:

- Super-admin expense management.
- Optional private receipt upload.
- Expense truth remains separate from maintenance log truth.

Maintenance:

- Room maintenance logs track operational maintenance state.
- Maintenance can optionally create/link expense records.
- Maintenance-blocked rooms feed readiness and command-centre visibility.

Cleaning/turnover:

- Cleaning/readiness state is modeled on rooms.
- Inferred turnover appears when a room departed today and was not manually marked ready.
- Staff can update readiness without introducing a separate housekeeping table.

Super Admin Correction Console:

- Controlled correction workflow for Guest Stay truth.
- Reason required, optional note, old/new diff, audit metadata, and room-overlap warning capture.

## 7. Technical Architecture

Core stack:

- Next.js 16 App Router.
- React 19.
- TypeScript.
- Tailwind CSS.
- Supabase Auth.
- Supabase Postgres.
- Supabase Storage.
- Supabase Row Level Security.
- Vercel deployment.

Role model:

- `guest`
- `manager`
- `admin`
- `super_admin`

Security and access patterns:

- Role guards protect management and super-admin routes.
- Private guest documents and expense receipts are stored in Supabase Storage.
- Guest document access uses short-lived signed URLs in protected admin surfaces.
- RLS is enabled across core operational tables.
- Storage policies restrict private document access.
- Server environment validation keeps service-role keys server-side only.

Data truth model:

- `guest_checkins` are the room/stay-level operational and financial source of truth.
- `booking_groups` are Lead Booking / responsible booker context only.
- Reports calculate from individual Guest Stays, not Lead Booking reference totals, to avoid double-counting multi-room bookings.
- Cleaning/readiness is room-level.
- Maintenance logs are operational truth; expenses are financial truth.
- Audit logs record sensitive correction and operational actions where implemented.

Validation/build commands:

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
node scripts/validate-super-admin-corrections.mjs
```

Relevant targeted validators:

```bash
node scripts/validate-room-reality-board.mjs
node scripts/validate-command-centre.mjs
node scripts/validate-guest-portal-concierge.mjs
node scripts/validate-cleaning-turnover-layer.mjs
node scripts/validate-phase-6-4-multi-room-bookings.mjs
node scripts/validate-phase-6-5-accommodation-receipt.mjs
node scripts/validate-guest-record-detail-v2.mjs
node scripts/validate-front-desk-entry-fixes.mjs
node scripts/validate-repeat-guest-intelligence.mjs
node scripts/validate-lead-booking-workspace.mjs
node scripts/validate-business-analytics-v2.mjs
node scripts/validate-super-admin-corrections.mjs
```

## 8. Validation Status

Passed in the current-state audit:

- `npm run typecheck`
- `npm run lint`
- `npm run build`
- `git diff --check`
- `node scripts/validate-super-admin-corrections.mjs`

Targeted validators passed:

- Room Reality Board.
- Command Centre.
- Cleaning/turnover layer.
- Phase 6.4 multi-room booking groups.
- Phase 6.5 Accommodation Receipt.
- Guest Record Detail v2.
- Front-desk entry fixes.
- Repeat guest intelligence.
- Lead Booking workspace.
- Business Analytics v2.
- Super Admin Corrections.

Known validation caveat:

- `node scripts/validate-guest-portal-concierge.mjs` failed three wording-pattern assertions. The failures are tied to stale expected phrases after later check-in language polish. The current implementation still routes Wi-Fi through a request message and does not expose Wi-Fi credentials. The validator should be refreshed to match the current approved hospitality language.

## 9. Operational Value Created

GreenLux Ops reduces WhatsApp, spreadsheet, and manual handover chaos by creating a shared operational record for Guest Stays, rooms, documents, payments, maintenance, charges, receipts, and reporting.

Traceability improved:

- Guest Stay records hold stay-level details.
- Document uploads are linked to stays.
- Payment Confirmation is tracked per stay.
- Supporting documents are separated from stay-specific payment proof.
- Lead Booking context does not blur individual room truth.

Occupancy and readiness improved:

- Room Reality Board shows room-level operational truth.
- Command Centre turns the current day into prioritized staff actions.
- Cleaning/turnover readiness is visible before arrivals.
- Maintenance-blocked rooms surface as operational risk.

Correction and recovery improved:

- Super Admin Correction Console provides controlled recovery without silent database editing.
- Correction reasons and old/new values create an audit-backed trail.
- Room/date correction warnings make risk visible.

Owner visibility improved:

- Business Analytics v2 supports revenue, paid revenue, Balance Due, expenses, net profit, occupancy, average rate/night, booking source, unit performance, daily performance, and CSV export.
- Finance and maintenance are visible without pretending the system is a full accounting product.

Operator usability improved:

- Admin language is operational and low-stress.
- Guest-facing language is calm and hospitality-led.
- Staff can recover from imperfect data instead of being blocked by rigid workflows.

## 10. Mustafa Work Evidence

Systems designed:

- A room/stay-level hospitality operations system for a real serviced-accommodation business.
- A role-aware admin platform with guest, manager, admin, and super-admin boundaries.
- A Lead Booking model that supports multi-room responsibility without corrupting stay-level truth.
- A reporting model that protects against multi-room revenue double counting.

Workflows implemented:

- Guest check-in and document upload.
- Admin Guest Stay creation.
- Repeat guest search and safe autofill.
- Room assignment and readiness workflows.
- Cleaning/turnover state management.
- Maintenance and expense workflows.
- Guest folio/additional charges.
- Accommodation receipts.
- Daily Command Centre.
- Business Analytics v2.
- Super Admin Correction Console.

Operational problems solved:

- Fragmented WhatsApp/spreadsheet coordination.
- Missing or late guest documents.
- Payment follow-up ambiguity.
- Room readiness uncertainty.
- Multi-room booking confusion.
- Repeat guest re-entry friction.
- Silent database correction risk.
- Owner reporting gaps.

Technical capabilities demonstrated:

- Next.js App Router architecture.
- Server actions and protected route patterns.
- Supabase Auth, Postgres, Storage, RLS, and signed URL usage.
- TypeScript and Zod validation.
- Report calculation logic, including room-night allocation.
- CSV export.
- Role-based authorization.
- Audit metadata design.
- Targeted validation scripts and production build discipline.

Security/privacy judgement:

- Kept guest documents and payment proof private.
- Avoided exposing Wi-Fi credentials in guest portal flows.
- Separated public marketing from protected operations.
- Restricted super-admin workflows.
- Kept service role configuration server-side.
- Avoided using Lead Booking totals as financial truth.

AI/Codex-assisted workflow evidence:

- Repo-local GreenLux task runner skill.
- Codex handover/context documentation.
- Phase-specific validators.
- Incremental commits with scoped feature delivery.
- Documentation of doctrine, validation, risks, and next steps.

Product thinking:

- Built for non-technical hotel staff under pressure.
- Prioritized clarity over feature bloat.
- Avoided premature PMS/channel-manager/accounting scope.
- Chose browser print/save-as-PDF before adding PDF tooling.
- Designed recovery workflows instead of fragile automation.

Project delivery discipline:

- Phase-based delivery history.
- Clear commit trail.
- Validation scripts attached to major features.
- README and context pack updated to reflect current state.
- Sensitive files left unstaged.

## 11. Career Use

CV bullets:

- Designed and built GreenLux Ops, a production MVP internal operations platform for a live serviced-accommodation business, using Next.js, React, TypeScript, Tailwind CSS, Supabase, RLS, and Vercel.
- Replaced fragmented WhatsApp/spreadsheet workflows with structured Guest Stay records, document tracking, payment follow-up, room readiness, receipts, and owner reporting.
- Implemented role-aware workflows for guests, managers, admins, and super admins, including a correction console with field-level audit metadata.
- Built Business Analytics v2 with room-night allocation, occupancy, average rate/night, paid revenue, Balance Due, expenses, maintenance visibility, and CSV exports.
- Delivered phase-based product increments with targeted validation scripts, production build checks, and privacy-aware operational boundaries.

LinkedIn bullets:

- Built a real hospitality operations system from the ground up for GreenLux Residency.
- Turned messy front-desk workflows into structured, secure, auditable operational software.
- Designed around the real constraint: do not block operations; make risk visible and manageable.
- Shipped modules for guest check-in, room readiness, command-centre operations, receipts, analytics, repeat guest handling, multi-room bookings, and super-admin recovery.
- Used AI-assisted development workflows responsibly: scoped phases, repo-backed validators, documentation, and careful public/private boundaries.

Interview STAR story angles:

- Situation: A serviced-accommodation business relied on WhatsApp, spreadsheets, and manual handovers for guest, room, payment, and document operations.
- Task: Build an internal system that improved control without blocking real front-desk work.
- Action: Designed a room/stay-level truth model, protected guest document storage, admin workflows, occupancy board, command centre, analytics, and audit-backed correction console.
- Result: Created a production MVP operating layer with clearer traceability, safer corrections, stronger reporting, and better day-to-day operational visibility.

Technical portfolio wording:

GreenLux Ops is a production MVP internal operations platform for serviced accommodation. It combines Next.js App Router, TypeScript, Supabase Auth/Postgres/Storage/RLS, Vercel deployment, role-based access control, private document handling, daily operations workflows, room-night reporting calculations, and audit-backed correction flows.

NHS/digital systems transferable wording:

- Built secure role-based workflows for sensitive personal documents and operational records.
- Designed systems that help non-technical users make safe decisions under time pressure.
- Balanced data integrity with real-world recovery paths.
- Created auditable correction workflows for high-trust operational data.
- Used clear service design language to reduce staff cognitive load.

Product/ops intelligence wording:

- Converted manual operational knowledge into structured workflows, dashboards, and exception handling.
- Designed metrics and reporting around decision needs, not vanity dashboards.
- Protected core data truth while allowing flexible real-world operations.
- Built an internal operating system pattern that can generalize to other SMEs.

Avoid in public/career claims unless separately evidenced:

- Quantified revenue uplift.
- Quantified guest satisfaction improvements.
- Claims that GreenLux Ops is a full PMS, channel manager, payment ledger, tax/accounting system, or automated WhatsApp product.
- Any claims requiring private guest, customer, payment, or production data.

## 12. Productisation Use

Hospitality Ops OS:

GreenLux Ops is a strong foundation for a lightweight Hospitality Ops OS for serviced apartments, boutique hotels, guest houses, and small hospitality operators that need clarity before full PMS complexity.

SME internal operating systems:

The pattern generalizes beyond hospitality: records of truth, role-based access, document workflows, daily action dashboards, audit-backed correction, reporting, and recovery from imperfect data.

Public-safe portfolio case study:

The repo supports a strong anonymized case study:

- Problem: fragmented operations across WhatsApp, spreadsheets, and informal handovers.
- Constraint: staff cannot be blocked when data is imperfect.
- Solution: secure, role-aware internal operating system.
- Proof: architecture, feature timeline, synthetic screenshots, validators, and code patterns.

Buyer-facing offer:

“I build internal operating systems for messy real-world businesses: replacing spreadsheets, WhatsApp follow-ups, and manual handovers with secure, auditable workflows staff can actually use.”

Operator discovery call:

Use GreenLux Ops as the conversation anchor for questions like:

- Where does your operational truth currently live?
- What must never block the front desk/team?
- What data gets lost in WhatsApp or spreadsheets?
- Which corrections currently require manual admin intervention?
- What reports do owners/managers need weekly?
- What documents or payments need secure tracking?

Synthetic demo walkthrough:

Build a fake-data walkthrough showing:

- New Guest Stay creation.
- Guest document upload.
- Room Reality Board.
- Command Centre.
- Guest Stay workspace.
- Lead Booking with multiple linked stays.
- Accommodation Receipt.
- Business Analytics v2.
- Super Admin Correction Console.

## 13. Public-Safe Portfolio Boundary

Safe to show:

- Architecture diagrams.
- Public website pages.
- Synthetic screenshots.
- Generic code patterns.
- Phase timeline.
- Anonymized operational problems.

Must anonymize or synthesize:

- Guest names.
- Phone numbers.
- CNIC/passport data.
- Documents.
- Payment confirmations.
- Receipt data.
- WhatsApp messages.
- Live occupancy.
- Revenue figures.
- Expenses.
- Audit logs.
- Internal record IDs.

Never show:

- `.env.local`.
- Supabase keys.
- Service role key.
- Production credentials.
- Private guest documents.
- Payment proof.
- Manual reset SQL contents.
- Production exports.
- Signed document URLs.
- Identifiable audit logs.

## 14. Next Recommended Assets

Public-safe case study:

- Create a written case study with synthetic screenshots and a clear public/private boundary.

Synthetic demo walkthrough:

- Build a fake dataset and record a short walkthrough of the operator journey.

Hospitality Ops OS offer page:

- Position the system as an internal operating system for serviced accommodation operators who are not ready for PMS/channel-manager complexity.

LinkedIn project post:

- Tell the story of turning messy operational reality into a secure internal platform, without exposing private guest/business data.

CV/project entry:

- Add a concise project entry emphasizing secure workflows, reporting, operations design, and production delivery.

Portfolio page:

- Include architecture, feature map, screenshots using synthetic data, technical stack, and validation approach.

Operator discovery questionnaire:

- Create a reusable questionnaire for SMEs to identify workflows currently stuck in WhatsApp, spreadsheets, inboxes, and manual memory.
