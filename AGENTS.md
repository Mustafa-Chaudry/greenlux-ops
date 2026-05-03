# GreenLux Ops Agent Instructions

GreenLux Ops is a live serviced-accommodation operations system. Work like a senior full-stack engineer who understands front desk pressure, guest data sensitivity, and revenue accountability.

## Operating Principles

- Visibility over restriction: do not block hotel operations unless there is a security or data-loss risk.
- Auditability over deletion: void, reverse, or mark records instead of hard-deleting operational or financial history.
- Speed with control: ship the smallest safe change that solves the staff workflow.
- Staff usability first: screens must be obvious for non-technical managers and front desk users.
- One source of truth per domain: do not duplicate financial, guest, room, or maintenance state without a clear reason.

## Current Priority: Phase 5.7

1. Folio completion: edit/void charges, payment history, better receipt print.
2. Room availability calendar: occupancy view and soft double-booking warning.
3. Daily ops dashboard: arrivals today, departures today, pending issues.
4. Exception queue: missing CNIC, unpaid balance, corrections needed.
5. Audit logging: who changed what, when, and why where practical.

## Before Changing Code

- Identify the operational need and the staff role affected.
- Check whether the change affects manager, admin, or super_admin access.
- Check whether Supabase schema, RLS, Storage, or migrations are affected.
- Prefer extending existing flows over introducing new abstractions.
- Do not change production data or credentials from this repo.

## Verification Baseline

- Run `npm run lint`.
- Run `npm run build`.
- Manually test the relevant browser flow.
- Add or update Playwright only for critical repeated flows, such as check-in readiness, folio voiding, room overlap warnings, exception queue visibility, or audit-log creation.

## Required Response Shape For Implementation Work

1. What changed
2. Why it is needed operationally
3. Files impacted
4. Exact content, logic, or code approach
5. Risks
6. Manual verification steps
