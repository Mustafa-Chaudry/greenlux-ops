# GreenLux Residency — Operations Intelligence System

A production-grade internal operations platform designed for a real serviced accommodation business.

GreenLux Ops replaces fragmented, manual workflows — WhatsApp coordination, spreadsheets, ad-hoc guest records, scattered payment tracking, and informal room handovers — with a structured, auditable, action-driven operational layer for a boutique serviced accommodation business in Rawalpindi / Islamabad.

**Status:** Production MVP — Phase 7.0  
**Core principle:** Do not block operations. Make risk visible and manageable.

---

## 🧠 Problem Context

GreenLux Residency operates in a high-friction hospitality environment:

- Bookings arrive from WhatsApp, walk-ins, Booking.com, Airbnb, Agoda, agents, and direct calls.
- Guests may be repeat visitors, families, corporate visitors, or one lead guest booking multiple rooms.
- Front-desk staff are non-technical and work under real check-in pressure.
- Guest data, ID documents, payment confirmation, and room details may arrive late or incomplete.
- Staff still need to keep rooms moving, collect payment, verify documents, and support guests without blocking operations.

Traditional systems often fail in this environment because they either:

- Block operations with rigid validation, or
- Allow chaos with no structured visibility.

GreenLux Ops is designed for the middle path: operational flexibility with visible risk, auditability, and recovery.

---

## 🎯 Solution Philosophy

> **Do not block operations — make risk visible and manageable.**

GreenLux Ops is not a traditional hotel PMS. It is an operational intelligence layer for a real serviced accommodation business.

The system prioritises:

- Visibility over restriction
- Admin-controlled recovery over fragile automation
- Room/stay-level truth over vague booking summaries
- Non-technical usability over technical purity
- Premium hospitality language over generic system jargon
- Auditability where corrections affect financial or operational truth

Example:

- Staff can create a Guest Stay even when some information is incomplete.
- The system surfaces risks such as ID pending, Payment Confirmation pending, Balance Due, room not ready, or missing supporting documents.
- These become actionable issues, not blockers.

This mirrors how real hotels operate under pressure while still improving data integrity.

---

## 🏗️ What GreenLux Ops Is

GreenLux Ops is a structured operations platform for:

- Guest Stay records
- Guest check-in and front-desk entry
- Repeat guest intelligence
- ID, payment, and supporting document tracking
- Room/unit assignment and readiness
- Lead Booking / multi-room responsibility workflows
- Receipts for accommodation and reimbursement
- Owner-grade business analytics
- Super-admin correction and audit recovery

It is intentionally not yet:

- A full booking engine


---

## ⚙️ Core System Capabilities

### 1. Guest Stay Operations

GreenLux uses **Guest Stays** as the operational source of truth for individual room stays.

Current capabilities include:

- Self-service guest check-in through `/dashboard/check-in`
- Admin/front-desk Add Guest Stay workflow
- Walk-in and WhatsApp booking handling
- Agent booking source support
- Primary guest ID/passport uploads
- Additional guest ID/passport uploads
- Supporting Documents for marriage certificates, authorization letters, company letters, or other supporting material
- Camera-friendly upload inputs where supported by the device/browser
- Payment Confirmation tracking
- Payment coverage / follow-up visibility
- Repeat guest autofill from previous stays
- Previous ID/supporting documents reused into new stays where appropriate
- Old payment proof excluded from reuse because payment confirmation is stay-specific

---

### 2. Room Reality Board

Route: `/admin/occupancy`

The Room Reality Board gives staff a fast operational view of all units.

It shows:

- Occupied / vacant / due-out / upcoming status
- Room/unit assignment
- Guest context
- Stay period and nights
- ID Verification state
- Payment Confirmation state
- Balance Due
- Room readiness and cleaning state
- Maintenance blocked rooms
- Multi-room booking context where relevant

The design goal is high-density, low-stress operational clarity.

---

### 3. Command Centre

Route: `/admin/command-centre`

The Command Centre is the daily manager screen.

It displays:

- Arrivals today
- Departures today
- Rooms needing cleaning
- Rooms not ready
- Maintenance blocked rooms
- Balance Due
- Pending ID / Payment Confirmation
- Multi-room booking attention
- Priority actions ordered by operational urgency

The Command Centre does not create new workflows. It orchestrates existing system truth into a daily action view.

---

### 4. Guest Stay Workspace

Route: `/admin/guest-records/[id]`

The Guest Stay detail page is the operational control panel for an individual room stay.

It includes:

- Top operational summary
- Priority alerts / Needs Attention
- Action panel
- Guest Stay details
- Payment & Charges
- Documents / ID Verification
- Supporting document uploads
- Guest Messages / WhatsApp actions
- Receipt actions
- Repeat Guest / Stay History
- Admin controls
- Super-admin correction console where authorised

The page is designed so staff can understand the current operational risk in under 10 seconds.

---
### 5. Verification Layer
- CNIC / Passport capture
- Payment proof tracking
- Document status:
  - `pending`
  - `verified`
  - `rejected`

---

### 6. Controlled Override System (Core Feature)
- Automated readiness detection (room, ID, payment)
- Exception-based check-in flow
- Structured issue tracking

→ Operations continue without blocking, while risks remain visible

---

### 7. Guest Folio & Additional Charges
- Track services (breakfast, tea, extra mattress, etc.)
- Paid vs unpaid charges
- Included in total revenue and outstanding balance
- Printable receipt-ready structure

---

### 8. Extend Stay Workflow
- Extend stay directly from guest record
- Updates expected revenue
- Tracks payment changes
- Adds audit trace

---

### 9. Maintenance & Expense Integration
- Maintenance logs (operational truth)
- Expenses (financial truth)
- Linked without double counting

### 10. Repeat Guest Intelligence

GreenLux supports returning guests without forcing them to re-enter details or reupload documents unnecessarily.

Staff can:

- Search previous guests by name, phone, CNIC/passport, or email
- See previous stay count
- See last stay, last room/unit, booking source, rate/night, document availability, and Balance Due warnings
- Prefill safe reusable details into a new Guest Stay
- Reuse previous ID/supporting documents into the new stay where appropriate
- Keep payment truth, room assignment, dates, and stay-specific verification separate

This is built for the real front-desk reality where many guests are walk-in, WhatsApp-based, or reluctant to self-register.

---

### 11. Lead Booking / Multi-Room Workflow

Route: `/admin/booking-groups/[id]`

GreenLux supports one responsible lead guest/booker managing multiple rooms.

The model is:

- **Lead Booking** = responsible booker / payment and coordination context
- **Guest Stay** = individual room/stay operational and financial truth

A Lead Booking can include rooms with different:

- Dates
- Nights
- Rates
- Occupants
- Payment status
- Balance Due
- Room readiness
- Receipt needs

The Lead Booking workspace shows all linked room stays together while preserving each room’s individual truth.

Important financial rule:

> Reports calculate revenue from individual Guest Stays, not Lead Booking reference totals, to avoid double-counting multi-room bookings.

---

### 12. Receipts

GreenLux includes a professional receipt workflow suitable for accommodation records and workplace reimbursement.

Route: `/admin/guest-records/[id]/receipt`

Receipt features:

- Clean printable Receipt layout
- Browser print / Save as PDF workflow
- Receipt reference and issue date
- Stay period and nights
- Rate/night
- Accommodation Charges
- Additional Charges
- Amount Paid
- Balance Due
- Payment method and status

Receipts remain stay-level unless a future combined multi-room receipt is explicitly built.

---

### 13. Business Analytics v2

Route: `/admin/reports`

The analytics layer has moved from simple booking totals to owner-grade business reporting.

Current analytics include:

- Daily / Weekly / Monthly / Custom report modes
- Visible final reporting period
- Room-night overlap allocation
- Expected Revenue
- Paid Revenue Recorded
- Balance Due
- Expenses
- Net Profit
- Booked Room Nights
- Occupancy
- Average Rate / Night
- Daily Performance
- Unit Performance
- Unit Type Performance
- Booking Source Performance
- Risk & Recovery / Attention Needed
- Supporting Detail
- CSV/export support where available

The report is designed to answer:

1. Are we making money?
2. Are rooms being used well?
3. Where is money coming from?
4. Which days performed well or badly?
5. What is leaking or unpaid?
6. What should we do next?

Important limitation:

**Paid Revenue Recorded** is based on recorded paid amounts. GreenLux does not yet have payment-date ledger accounting.

---

### 14. Super Admin Correction Console

Phase 7.0 adds controlled recovery for real-world data mistakes.

Super admins can correct key Guest Stay data from inside the platform, including:

- Guest identity and contact fields
- Stay dates
- Assigned room
- Booking source
- Guest count
- Stay status
- Payment status and method
- Agreed room rate
- Total expected amount
- Amount paid
- ID Verification / Payment Confirmation flags
- Internal notes
- Lead Booking context

Corrections require a reason and are audit logged with old/new values where supported by the existing audit log structure.

This avoids silent database editing while still allowing real operational recovery.

---

## 🧾 Data Truth Model

GreenLux separates responsibility, room-level truth, documents, and financial reporting.

Core tables include:

- `users_profile` — user roles and access context
- `rooms` — unit inventory and readiness state
- `guest_checkins` — room/stay-level operational and financial truth
- `guest_documents` — ID, payment, and supporting documents
- `guest_charges` — additional stay charges
- `expenses` — business expense truth
- `room_maintenance_logs` — operational maintenance records
- `booking_groups` — Lead Booking / responsible booker context
- `audit_logs` — correction and operational audit trail

Key rules:

- Guest Stays are the source of financial truth.
- Lead Bookings are responsibility and coordination context.
- Payment confirmation is stay-specific.
- Previous ID/supporting documents may be reused for repeat guests.
- Previous payment proof is not reused for a new stay.
- Reports use individual Guest Stays to avoid double-counting multi-room bookings.

---

## ⚙️ System Architecture

![GreenLux Architecture](./Architecture.png)

The system is built with:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Postgres
- Supabase Auth
- Supabase Storage
- Row Level Security
- Private signed URL document access
- Vercel deployment

Role-based access includes:

- Manager: operational access
- Admin: extended operations
- Super Admin: correction and full recovery control

---

## 🔄 Operational Transformation

### Before

- WhatsApp-based coordination
- Repeated guest data entry
- Informal document collection
- Manual room tracking
- Unclear responsibility for management and staff
- Payment follow-up handled from memory
- Limited owner-level reporting
- Mistake correction through manual database intervention

### After

- Centralised Guest Stay records
- Front-desk and self-service check-in workflows
- Repeat guest intelligence
- Previous documents reused safely where appropriate
- Lead Booking workspace for multi-room responsible bookers
- Room Reality Board
- Daily Command Centre
- Professional receipts
- Owner-grade analytics
- Super-admin correction with audit trail

---

## ⚠️ Real-World Trade-offs

This system intentionally:

- Does not block check-in because some data is incomplete
- Avoids premature booking-engine complexity
- Avoids automatic WhatsApp sending for now
- Keeps payment confirmation stay-specific
- Keeps Lead Booking totals out of revenue truth
- Uses browser PDF printing before adding PDF libraries
- Prioritises operational continuity over theoretical perfection

Instead, it enforces:

- Risk visibility
- Staff follow-up
- Admin recovery
- Financial clarity
- Auditability where corrections matter

---

## ⚠️ Known Limitations / Future Work

Not yet built:

- Full booking engine
- Channel manager integration
- Automatic WhatsApp sending
- Payment ledger / payment-date accounting
- Combined multi-room receipt
- Cleaner role and inspection module
- Lost property register
- Historical Booking.com / Airbnb / Agoda imports
- Tax invoice / accounting system
- Optimised production logo and full brand asset integration

Likely next phases:

- Cleaner Role + Housekeeping Inspection
- Lost Property Register
- Historical Booking Imports
- Payment Ledger
- Combined Multi-Room Receipt
- Asset/logo/public website integration

---

## 🚀 What This Demonstrates

- Real-world system design under operational constraints  
- Translating messy operations into structured systems  
- Building for non-technical users  
- Balancing flexibility with data integrity  
- Product thinking over pure engineering  

---

## 📌 Validation / Developer Notes

Standard validation commands:

```bash
npm run typecheck
npm run lint
npm run build
git diff --check
```

Feature validators currently used across the project include:

```bash
node scripts/validate-room-reality-board.mjs
node scripts/validate-cleaning-turnover-layer.mjs
node scripts/validate-phase-6-4-multi-room-bookings.mjs
node scripts/validate-phase-6-5-accommodation-receipt.mjs
node scripts/validate-command-centre.mjs
node scripts/validate-guest-record-detail-v2.mjs
node scripts/validate-front-desk-entry-fixes.mjs
node scripts/validate-repeat-guest-intelligence.mjs
node scripts/validate-lead-booking-workspace.mjs
node scripts/validate-business-analytics-v2.mjs
node scripts/validate-super-admin-corrections.mjs
```

Deployment discipline:

- Apply Supabase migrations before deploying code that depends on new tables, columns, or enum values.
- Do not deploy schema-dependent code before the database is ready.
- Do not accidentally commit manual reset/test cleanup scripts.
- Do not commit large raw assets unless intentionally optimised and used.

---

## 📍 Deployment

Internal Operations System:  
https://greenlux-ops.vercel.app/admin

Command Centre:  
https://greenlux-ops.vercel.app/admin/command-centre

Room Reality Board:  
https://greenlux-ops.vercel.app/admin/occupancy

Add Guest Stay:  
https://greenlux-ops.vercel.app/admin/guests/new

Guest Stays:  
https://greenlux-ops.vercel.app/admin/guest-records

Business Analytics:  
https://greenlux-ops.vercel.app/admin/reports

Guest Check-in:  
https://greenlux-ops.vercel.app/dashboard/check-in

Public Website:  
https://greenluxresidency.com

---

## 📌 Status

**Production MVP — Phase 7.0**

Built and iterated against real GreenLux Residency operational workflows.

The system now covers guest stay operations, repeat guest handling, lead booking responsibility, room reality, command-centre operations, receipts, business analytics, and super-admin correction.

---

## 👤 Author

Mustafa Chaudry  
MSc Computer Science (Artificial Intelligence)  
Sheffield, UK
