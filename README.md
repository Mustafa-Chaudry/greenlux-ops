# GreenLux Residency

Production-grade MVP foundation for GreenLux Residency, a boutique serviced apartment and luxury short-stay business in Rawalpindi/Islamabad.

This repository currently contains **Phase 1 only**: Next.js foundation, Supabase auth/database/storage setup, role-based access control, RLS policies, seed room data, and setup/security documentation. Public website pages, guest check-in forms, and management dashboards are intentionally left for the next phases.

## Architecture

```text
.
├── middleware.ts                         # Supabase session refresh
├── supabase/
│   └── migrations/
│       └── 20260429000000_phase_1_foundation.sql
├── src/
│   ├── app/
│   │   ├── page.tsx                      # Phase 1 landing/status shell
│   │   ├── auth/                         # Sign in/up server actions and pages
│   │   ├── dashboard/                    # Protected guest/account shell
│   │   └── admin/                        # Protected management/super-admin shells
│   ├── components/
│   │   ├── auth/
│   │   └── ui/                           # Clean reusable shadcn-style primitives
│   ├── lib/
│   │   ├── auth/                         # RBAC roles and route guards
│   │   ├── supabase/                     # Browser, server, middleware clients
│   │   ├── validation/                   # Auth/upload validation constants
│   │   └── env.ts                        # Zod environment validation
│   └── types/
│       └── database.ts                   # Supabase database types
└── .env.example
```

## Tech Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS with GreenLux brand tokens
- Supabase Auth, Postgres, Storage, and RLS
- Zod validation
- Clean reusable UI components inspired by shadcn/ui
- Vercel-ready build scripts

Node.js `>=20.9.0` is required by Next.js 16.

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

`SUPABASE_SERVICE_ROLE_KEY` is server-only and optional for Phase 1. Never expose it to client components.

4. Start the app:

```bash
pnpm dev
```

The scripts use webpack explicitly because the local Windows runtime used during scaffolding could not spawn Turbopack worker processes reliably.

## Supabase Setup

Create a Supabase project, then apply:

```bash
supabase db push
```

If you are not using the Supabase CLI yet, paste the SQL from:

```text
supabase/migrations/20260429000000_phase_1_foundation.sql
```

into the Supabase SQL editor and run it once.

The migration creates:

- `users_profile`
- `rooms`
- `guest_checkins`
- `guest_documents`
- `expenses`
- `room_maintenance_logs`
- `audit_logs`
- private storage buckets: `guest-documents`, `expense-receipts`
- room seed data for Economy, Executive, Deluxe, Studio, and Full Apartment
- RLS policies and guard triggers

## Roles

Supported roles:

- `guest`
- `manager`
- `admin`
- `super_admin`

`manager`, `admin`, and `super_admin` are operational management roles. `super_admin` is reserved for the business-owner dashboard, role management, analytics, finance, expenses, reports, and audit logs.

## Super Admin Bootstrap

No real credentials are committed. To create a test owner account:

1. Sign up in the app with an email/password.
2. In the Supabase SQL editor, promote that user:

```sql
update public.users_profile
set role = 'super_admin'
where email = 'owner@example.com';
```

3. Sign out and sign back in.

For manager/admin test users, repeat the same flow and set `role = 'manager'` or `role = 'admin'`.

## Security Notes

- CNIC/passport images and payment proofs are stored in private Supabase Storage buckets.
- Storage buckets enforce allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`.
- Storage buckets enforce a 10 MB file-size limit.
- Future document viewing should use short-lived signed URLs, not public bucket URLs.
- Guest document paths should use this convention:

```text
guest-documents/{user_id}/{checkin_id}/{filename}
```

- Expense receipt paths should use:

```text
expense-receipts/{user_id}/{expense_id}/{filename}
```

- Guests cannot read other guests' profiles, check-ins, or documents.
- Guests read their own check-in records through `guest_checkins_guest_view`, which excludes internal notes, guest tags, agreed rate, and amount-paid management fields.
- Direct `guest_checkins` table reads are management-only through RLS.
- A trigger blocks guests from changing internal management fields such as assigned room, agreed rate, payment status, internal notes, verification flags, and guest tag.
- A trigger blocks role changes unless the actor is a `super_admin`, the SQL editor/postgres owner, or the service role.
- Audit logs are available to `super_admin`; automatic audit triggers are intentionally not enabled yet to avoid duplicating sensitive CNIC/payment metadata.

## Verification

These checks passed during Phase 1:

```bash
node node_modules/typescript/bin/tsc --noEmit
node node_modules/eslint/bin/eslint.js .
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co \
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key \
node node_modules/next/dist/bin/next build --webpack
```

In the Codex Windows shell, direct `pnpm typecheck` hit a local shim execution permission issue, so the underlying tools were run through Node directly.

## Proposed Next Tasks

1. Phase 2: Build the public GreenLux website: home, rooms, room detail, about, contact, privacy, and terms.
2. Phase 3: Build guest profile and check-in flow with CNIC/payment-proof uploads and consent.
3. Phase 4: Build management dashboard: records table, detail/edit, room management, CSV export, WhatsApp template.
4. Phase 5: Build super admin analytics, expenses, maintenance, reports, and business intelligence charts.
5. Add focused integration tests around auth guards, upload validation, and RLS-sensitive data access.

