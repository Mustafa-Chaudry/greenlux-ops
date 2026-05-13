begin;

-- Phase 6.3: add a small, staff-controlled room readiness layer.
-- This is intentionally stored on public.rooms instead of creating a full
-- housekeeping system. It preserves existing room inventory, RLS, functions,
-- guest workflows, folios, expenses, and reporting calculations.
do $$
begin
  create type public.room_cleaning_status as enum (
    'ready',
    'cleaning_required',
    'cleaning_in_progress',
    'maintenance_blocked'
  );
exception
  when duplicate_object then null;
end $$;

alter table public.rooms
  add column if not exists cleaning_status public.room_cleaning_status not null default 'ready',
  add column if not exists cleaning_status_updated_at timestamptz,
  add column if not exists cleaning_status_updated_by uuid references public.users_profile(id) on delete set null;

create index if not exists rooms_cleaning_status_idx
  on public.rooms(cleaning_status);

comment on column public.rooms.cleaning_status is
  'Manual staff-controlled readiness state for simple cleaning and turnover visibility.';

comment on column public.rooms.cleaning_status_updated_at is
  'Timestamp of the latest manual cleaning/readiness status change. Used to avoid overstating inferred turnover after staff marks a room ready.';

comment on column public.rooms.cleaning_status_updated_by is
  'Staff profile that last changed the manual cleaning/readiness status.';

commit;
