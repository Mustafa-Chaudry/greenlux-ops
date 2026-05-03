begin;

create table if not exists public.guest_charges (
  id uuid primary key default gen_random_uuid(),
  guest_checkin_id uuid not null references public.guest_checkins(id) on delete cascade,
  charge_type text not null,
  description text,
  amount_pkr numeric(12, 2) not null default 0,
  quantity integer not null default 1,
  total_amount_pkr numeric(12, 2) generated always as (amount_pkr * quantity) stored,
  is_paid boolean not null default false,
  payment_method public.payment_method,
  charged_at timestamptz not null default now(),
  created_by uuid references public.users_profile(id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guest_charges_type_check check (
    charge_type in (
      'breakfast',
      'tea',
      'extra_bed',
      'additional_mattress',
      'late_checkout',
      'laundry',
      'room_service',
      'damage',
      'other'
    )
  ),
  constraint guest_charges_amount_nonnegative check (amount_pkr >= 0),
  constraint guest_charges_quantity_positive check (quantity > 0),
  constraint guest_charges_paid_method_check check (not is_paid or payment_method is not null)
);

create index if not exists guest_charges_checkin_idx
  on public.guest_charges(guest_checkin_id);

create index if not exists guest_charges_type_paid_idx
  on public.guest_charges(charge_type, is_paid);

drop trigger if exists set_guest_charges_updated_at on public.guest_charges;
create trigger set_guest_charges_updated_at
before update on public.guest_charges
for each row execute function public.set_updated_at();

alter table public.room_maintenance_logs
  add column if not exists actual_cost_pkr numeric(12, 2),
  add column if not exists vendor_paid_to text,
  add column if not exists payment_method public.payment_method,
  add column if not exists linked_expense_id uuid;

do $$
begin
  alter table public.room_maintenance_logs
    add constraint room_maintenance_actual_cost_nonnegative
    check (actual_cost_pkr is null or actual_cost_pkr >= 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.room_maintenance_logs
    add constraint room_maintenance_linked_expense_fk
    foreign key (linked_expense_id)
    references public.expenses(id)
    on delete set null;
exception
  when duplicate_object then null;
end $$;

create index if not exists room_maintenance_linked_expense_idx
  on public.room_maintenance_logs(linked_expense_id);

alter table public.guest_charges enable row level security;

drop policy if exists "Management can manage guest charges" on public.guest_charges;
create policy "Management can manage guest charges"
on public.guest_charges
for all
to authenticated
using (public.is_management())
with check (public.is_management());

grant select, insert, update, delete on public.guest_charges to authenticated;

commit;
