# GreenLux Ops — Codex Handover Context

## Current repo location

The active GreenLux Ops repository is located at:

`D:\Projects\greenlux-ops`

Older Codex chats may reference an old or missing working directory. Those old chats are historical context only. All future work must operate from this active repo path.

## Product context

GreenLux Ops is an internal operations intelligence system for GreenLux Residency, a real serviced accommodation and boutique hospitality business in the Rawalpindi-Islamabad market.

The system is not a generic booking engine. It is an operational control layer for messy real-world hospitality workflows.

Primary operating reality:

- WhatsApp/direct calls remain a major booking and coordination channel.
- Booking.com and Airbnb create demand.
- Staff are non-technical.
- Check-in often happens under imperfect conditions.
- The system must not block real operations unnecessarily.
- Risk should be visible, recoverable, and auditable.

Core principle:

Do not block operations. Make risk visible and manageable.

## Current capabilities

The system includes:

- Guest self-service check-in
- Admin-assisted check-in
- Guest records
- CNIC/passport document capture and verification
- Payment proof/status tracking
- Room assignment
- Role-based admin access
- Guest folio and additional charges
- Extend stay workflow
- Expenses
- Maintenance logs
- Reports and analytics
- Occupancy dashboard
- Command centre daily operations page
- WhatsApp-assisted operational actions

## Important routes

- `/admin`
- `/admin/guest-records`
- `/admin/guest-records/[id]`
- `/admin/occupancy`
- `/admin/reports`
- `/admin/expenses`
- `/admin/maintenance`
- `/admin/command-centre`
- `/dashboard/check-in`

## Data model concepts

Core tables include:

- `users_profile`
- `guest_checkins`
- `guest_documents`
- `rooms`
- `guest_charges`
- `expenses`
- `room_maintenance_logs`
- `audit_logs`

Role model:

- `guest`
- `manager`
- `admin`
- `super_admin`

Operational role intent:

- Guests should only access their own guest-facing flow.
- Managers can operate daily workflows.
- Admins can manage broader operations.
- Super admins control financial/system-level truth.

## Existing known users from setup/testing

Current users may include:

- Mustafa Chaudry = super_admin
- Mujtaba Aamir = admin
- Murtaza Chaudry = manager
- Javeria Munir = guest/test guest
- Test User = test manager account

Do not assume these users are production-clean. Do not delete users unless explicitly asked.

## Security hardening context

Supabase Security Advisor currently flagged:

Errors:

- Security Definer View:
  - `public.guest_checkins_guest_view`
  - `public.guest_checkins_management_view`

Warnings:

- Function Search Path Mutable:
  - `public.set_updated_at`

SECURITY DEFINER functions executable too broadly:

- `public.handle_new_user()`
- `public.is_management(user_id uuid)`
- `public.is_super_admin(user_id uuid)`
- `public.owns_checkin(checkin_id uuid, user_id uuid)`
- `public.prevent_guest_internal_checkin_changes()`
- `public.prevent_unauthorized_role_change()`

Auth warning:

- Leaked password protection disabled

These warnings are not mainly caused by test users. They are database hardening issues around functions, views, and permissions.

## Important implementation rules

Do not:

- Break working flows.
- Delete required functions.
- Remove RLS policies casually.
- Change live operational meaning without explaining.
- Create fake guest data.
- Build a parallel booking engine.
- Overengineer integrations too early.

Always:

- Prefer migrations for database changes.
- Preserve auditability.
- Preserve admin control.
- Keep non-technical staff usability.
- Make incomplete/risky states visible.
- Link actions back to existing admin screens.
- Test guest, manager, admin, and super_admin flows after changes.

## Recent Phase 5.9 context

Phase 5.9 added `/admin/command-centre`.

Purpose:

A single daily operating screen that shows:

- immediate actions
- today timeline
- unit/occupancy snapshot
- money snapshot
- quick actions

It should reuse existing data and admin screens rather than create disconnected new flows.

Files involved may include:

- `src/app/admin/command-centre/page.tsx`
- `scripts/validate-command-centre.mjs`
- existing analytics/reporting/occupancy helpers

## Next planned work

Next priority is Phase 6 hardening:

1. Fix Supabase Security Advisor issues through a migration.
2. Keep all role-based access working.
3. Keep guest check-in working.
4. Preserve signup profile creation.
5. Preserve management dashboards.
6. Re-run advisor/linter checks.
7. Clean up or demote test users only after security migration is tested.

## Working style for Codex

Before editing:

- Verify current working directory.
- Confirm repo root files.
- Check git status.
- Inspect relevant migrations and policies.
- Explain plan before making changes.

After editing:

- Provide changed files.
- Explain why changes were made.
- Run typecheck/lint/build or available validation scripts.
- Provide commit message.
- Mention any remaining warnings.
