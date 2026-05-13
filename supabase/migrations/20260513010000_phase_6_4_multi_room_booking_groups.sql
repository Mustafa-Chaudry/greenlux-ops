begin;

alter type public.booking_source add value if not exists 'agoda';

create table if not exists public.booking_groups (
  id uuid primary key default gen_random_uuid(),
  lead_guest_name text not null,
  lead_guest_phone text not null,
  lead_guest_email text,
  booking_source public.booking_source not null default 'direct_whatsapp_call',
  check_in_date date not null,
  check_out_date date not null,
  expected_total_amount numeric(12, 2),
  paid_total_amount numeric(12, 2),
  notes text,
  created_by uuid references public.users_profile(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint booking_groups_valid_dates check (check_out_date > check_in_date),
  constraint booking_groups_expected_total_nonnegative check (expected_total_amount is null or expected_total_amount >= 0),
  constraint booking_groups_paid_total_nonnegative check (paid_total_amount is null or paid_total_amount >= 0)
);

create index if not exists booking_groups_dates_idx
  on public.booking_groups(check_in_date, check_out_date);

create index if not exists booking_groups_lead_guest_idx
  on public.booking_groups(lead_guest_name, lead_guest_phone);

drop trigger if exists set_booking_groups_updated_at on public.booking_groups;
create trigger set_booking_groups_updated_at
before update on public.booking_groups
for each row execute function public.set_updated_at();

alter table public.guest_checkins
  add column if not exists booking_group_id uuid references public.booking_groups(id) on delete set null;

create index if not exists guest_checkins_booking_group_idx
  on public.guest_checkins(booking_group_id);

alter table public.booking_groups enable row level security;

drop policy if exists "Management can manage booking groups" on public.booking_groups;
create policy "Management can manage booking groups"
on public.booking_groups
for all
to authenticated
using (public.is_management())
with check (public.is_management());

grant select, insert, update, delete on public.booking_groups to authenticated;

commit;
