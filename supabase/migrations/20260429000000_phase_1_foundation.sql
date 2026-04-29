begin;

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('guest', 'manager', 'admin', 'super_admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.room_type as enum ('economy_room', 'executive_room', 'deluxe_room', 'studio', 'apartment');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.room_status as enum ('active', 'inactive', 'maintenance');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.purpose_of_visit as enum ('family_visit', 'business', 'medical', 'tourism', 'event_wedding', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.booking_source as enum ('booking_com', 'airbnb', 'direct_whatsapp_call', 'referral', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_method as enum ('cash', 'bank_transfer', 'online_payment', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('pending', 'partial', 'paid', 'refunded');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.guest_tag as enum ('new', 'repeat', 'vip', 'issue', 'do_not_host');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.document_type as enum ('primary_cnic', 'additional_guest_cnic', 'payment_proof', 'other');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.expense_category as enum (
    'maintenance',
    'repairs',
    'cleaning',
    'salaries',
    'utilities',
    'electricity',
    'gas',
    'internet',
    'laundry',
    'supplies',
    'platform_commission',
    'other'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.maintenance_status as enum ('reported', 'in_progress', 'resolved');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.users_profile (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  role public.user_role not null default 'guest',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  type public.room_type not null,
  description text,
  base_price_pkr numeric(12, 2) not null check (base_price_pkr >= 0),
  max_guests integer not null check (max_guests > 0),
  amenities text[] not null default '{}',
  status public.room_status not null default 'active',
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_checkins (
  id uuid primary key default gen_random_uuid(),
  guest_user_id uuid references public.users_profile(id) on delete set null,
  full_name text not null,
  phone text not null,
  email text not null,
  cnic_passport_number text not null,
  address text not null,
  city_country_from text not null,
  check_in_date date not null,
  check_out_date date not null,
  estimated_arrival_time time,
  number_of_guests integer not null check (number_of_guests > 0),
  purpose_of_visit public.purpose_of_visit not null,
  booking_source public.booking_source not null,
  payment_method public.payment_method not null,
  agreed_room_rate_pkr numeric(12, 2) check (agreed_room_rate_pkr is null or agreed_room_rate_pkr >= 0),
  amount_paid_pkr numeric(12, 2) check (amount_paid_pkr is null or amount_paid_pkr >= 0),
  payment_status public.payment_status not null default 'pending',
  assigned_room_id uuid references public.rooms(id) on delete set null,
  special_requests text,
  internal_notes text,
  guest_tag public.guest_tag not null default 'new',
  cnic_verified boolean not null default false,
  payment_verified boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guest_checkins_valid_dates check (check_out_date > check_in_date)
);

create table if not exists public.guest_documents (
  id uuid primary key default gen_random_uuid(),
  checkin_id uuid not null references public.guest_checkins(id) on delete cascade,
  uploaded_by uuid references public.users_profile(id) on delete set null,
  document_type public.document_type not null,
  file_url text,
  file_path text not null,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'application/pdf')),
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  category public.expense_category not null,
  amount_pkr numeric(12, 2) not null check (amount_pkr >= 0),
  expense_date date not null,
  paid_to text not null,
  payment_method public.payment_method not null,
  related_room_id uuid references public.rooms(id) on delete set null,
  receipt_file_url text,
  receipt_file_path text,
  notes text,
  created_by uuid references public.users_profile(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.room_maintenance_logs (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  issue_title text not null,
  issue_description text,
  status public.maintenance_status not null default 'reported',
  cost_pkr numeric(12, 2) check (cost_pkr is null or cost_pkr >= 0),
  reported_date date not null default current_date,
  resolved_date date,
  notes text,
  created_by uuid references public.users_profile(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint room_maintenance_valid_dates check (resolved_date is null or resolved_date >= reported_date)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users_profile(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists users_profile_role_idx on public.users_profile(role);
create index if not exists rooms_status_type_idx on public.rooms(status, type);
create index if not exists guest_checkins_guest_user_idx on public.guest_checkins(guest_user_id);
create index if not exists guest_checkins_dates_idx on public.guest_checkins(check_in_date, check_out_date);
create index if not exists guest_checkins_payment_status_idx on public.guest_checkins(payment_status);
create index if not exists guest_checkins_booking_source_idx on public.guest_checkins(booking_source);
create index if not exists guest_documents_checkin_idx on public.guest_documents(checkin_id);
create index if not exists expenses_date_category_idx on public.expenses(expense_date, category);
create index if not exists expenses_room_idx on public.expenses(related_room_id);
create index if not exists maintenance_room_status_idx on public.room_maintenance_logs(room_id, status);
create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id);
create index if not exists audit_logs_actor_idx on public.audit_logs(actor_user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_users_profile_updated_at on public.users_profile;
create trigger set_users_profile_updated_at
before update on public.users_profile
for each row execute function public.set_updated_at();

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists set_guest_checkins_updated_at on public.guest_checkins;
create trigger set_guest_checkins_updated_at
before update on public.guest_checkins
for each row execute function public.set_updated_at();

drop trigger if exists set_expenses_updated_at on public.expenses;
create trigger set_expenses_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

drop trigger if exists set_room_maintenance_logs_updated_at on public.room_maintenance_logs;
create trigger set_room_maintenance_logs_updated_at
before update on public.room_maintenance_logs
for each row execute function public.set_updated_at();

create or replace function public.is_management(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile
    where id = user_id
      and role in ('manager', 'admin', 'super_admin')
  );
$$;

create or replace function public.is_super_admin(user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users_profile
    where id = user_id
      and role = 'super_admin'
  );
$$;

create or replace function public.owns_checkin(checkin_id uuid, user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.guest_checkins
    where id = checkin_id
      and guest_user_id = user_id
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users_profile (id, full_name, phone, email, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    new.email,
    'guest'
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.prevent_unauthorized_role_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
     and not public.is_super_admin(auth.uid())
     and coalesce(auth.role(), '') <> 'service_role'
     and current_user <> 'postgres'
  then
    raise exception 'Only super admins can change user roles.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_unauthorized_role_change on public.users_profile;
create trigger prevent_unauthorized_role_change
before update on public.users_profile
for each row execute function public.prevent_unauthorized_role_change();

create or replace function public.prevent_guest_internal_checkin_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_management(auth.uid()) or coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    if new.assigned_room_id is not null
       or new.agreed_room_rate_pkr is not null
       or new.payment_status <> 'pending'
       or new.internal_notes is not null
       or new.guest_tag <> 'new'
       or new.cnic_verified
       or new.payment_verified
    then
      raise exception 'Guests cannot set internal check-in management fields.';
    end if;

    return new;
  end if;

  if new.assigned_room_id is distinct from old.assigned_room_id
     or new.agreed_room_rate_pkr is distinct from old.agreed_room_rate_pkr
     or new.amount_paid_pkr is distinct from old.amount_paid_pkr
     or new.payment_status is distinct from old.payment_status
     or new.internal_notes is distinct from old.internal_notes
     or new.guest_tag is distinct from old.guest_tag
     or new.cnic_verified is distinct from old.cnic_verified
     or new.payment_verified is distinct from old.payment_verified
  then
    raise exception 'Guests cannot update internal check-in management fields.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_guest_internal_checkin_changes on public.guest_checkins;
create trigger prevent_guest_internal_checkin_changes
before insert or update on public.guest_checkins
for each row execute function public.prevent_guest_internal_checkin_changes();

alter table public.users_profile enable row level security;
alter table public.rooms enable row level security;
alter table public.guest_checkins enable row level security;
alter table public.guest_documents enable row level security;
alter table public.expenses enable row level security;
alter table public.room_maintenance_logs enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Profiles are visible to owner and management" on public.users_profile;
create policy "Profiles are visible to owner and management"
on public.users_profile
for select
to authenticated
using (id = auth.uid() or public.is_management());

drop policy if exists "Users can insert their own profile" on public.users_profile;
create policy "Users can insert their own profile"
on public.users_profile
for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "Users can update own profile and super admins can update all" on public.users_profile;
create policy "Users can update own profile and super admins can update all"
on public.users_profile
for update
to authenticated
using (id = auth.uid() or public.is_super_admin())
with check (id = auth.uid() or public.is_super_admin());

drop policy if exists "Active rooms are public and all rooms are visible to management" on public.rooms;
create policy "Active rooms are public and all rooms are visible to management"
on public.rooms
for select
to anon, authenticated
using (status = 'active' or public.is_management());

drop policy if exists "Management can create rooms" on public.rooms;
create policy "Management can create rooms"
on public.rooms
for insert
to authenticated
with check (public.is_management());

drop policy if exists "Management can update rooms" on public.rooms;
create policy "Management can update rooms"
on public.rooms
for update
to authenticated
using (public.is_management())
with check (public.is_management());

drop policy if exists "Management can delete rooms" on public.rooms;
create policy "Management can delete rooms"
on public.rooms
for delete
to authenticated
using (public.is_management());

drop policy if exists "Management can read operational check-ins" on public.guest_checkins;
create policy "Management can read operational check-ins"
on public.guest_checkins
for select
to authenticated
using (public.is_management());

drop policy if exists "Guests and management can create check-ins" on public.guest_checkins;
create policy "Guests and management can create check-ins"
on public.guest_checkins
for insert
to authenticated
with check (guest_user_id = auth.uid() or public.is_management());

drop policy if exists "Guests can update own check-ins and management can update all" on public.guest_checkins;
create policy "Guests can update own check-ins and management can update all"
on public.guest_checkins
for update
to authenticated
using (guest_user_id = auth.uid() or public.is_management())
with check (guest_user_id = auth.uid() or public.is_management());

drop policy if exists "Management can delete check-ins" on public.guest_checkins;
create policy "Management can delete check-ins"
on public.guest_checkins
for delete
to authenticated
using (public.is_management());

drop policy if exists "Documents are visible to owner or management" on public.guest_documents;
create policy "Documents are visible to owner or management"
on public.guest_documents
for select
to authenticated
using (
  public.is_management()
  or public.owns_checkin(guest_documents.checkin_id)
);

drop policy if exists "Guests can upload documents for own check-ins" on public.guest_documents;
create policy "Guests can upload documents for own check-ins"
on public.guest_documents
for insert
to authenticated
with check (
  public.is_management()
  or (
    uploaded_by = auth.uid()
    and public.owns_checkin(guest_documents.checkin_id)
  )
);

drop policy if exists "Management can update guest documents" on public.guest_documents;
create policy "Management can update guest documents"
on public.guest_documents
for update
to authenticated
using (public.is_management())
with check (public.is_management());

drop policy if exists "Management can delete guest documents" on public.guest_documents;
create policy "Management can delete guest documents"
on public.guest_documents
for delete
to authenticated
using (public.is_management());

drop policy if exists "Super admins can manage expenses" on public.expenses;
create policy "Super admins can manage expenses"
on public.expenses
for all
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

drop policy if exists "Management can manage maintenance logs" on public.room_maintenance_logs;
create policy "Management can manage maintenance logs"
on public.room_maintenance_logs
for all
to authenticated
using (public.is_management())
with check (public.is_management());

drop policy if exists "Super admins can read audit logs" on public.audit_logs;
create policy "Super admins can read audit logs"
on public.audit_logs
for select
to authenticated
using (public.is_super_admin());

drop policy if exists "Management can create audit logs" on public.audit_logs;
create policy "Management can create audit logs"
on public.audit_logs
for insert
to authenticated
with check (actor_user_id = auth.uid() and public.is_management());

create or replace view public.guest_checkins_guest_view
as
select
  id,
  guest_user_id,
  full_name,
  phone,
  email,
  cnic_passport_number,
  address,
  city_country_from,
  check_in_date,
  check_out_date,
  estimated_arrival_time,
  number_of_guests,
  purpose_of_visit,
  booking_source,
  payment_method,
  payment_status,
  assigned_room_id,
  special_requests,
  cnic_verified,
  payment_verified,
  created_at,
  updated_at
from public.guest_checkins
where guest_user_id = auth.uid();

create or replace view public.guest_checkins_management_view
as
select *
from public.guest_checkins
where public.is_management();

grant usage on schema public to anon, authenticated;
grant select on public.rooms to anon, authenticated;
grant select, insert, update, delete on public.rooms to authenticated;
grant select, insert, update on public.users_profile to authenticated;
grant select, insert, update, delete on public.guest_checkins to authenticated;
grant select on public.guest_checkins_guest_view to authenticated;
grant select on public.guest_checkins_management_view to authenticated;
grant select, insert, update, delete on public.guest_documents to authenticated;
grant select, insert, update, delete on public.expenses to authenticated;
grant select, insert, update, delete on public.room_maintenance_logs to authenticated;
grant select, insert on public.audit_logs to authenticated;
grant execute on function public.is_management(uuid) to anon, authenticated;
grant execute on function public.is_super_admin(uuid) to authenticated;
grant execute on function public.owns_checkin(uuid, uuid) to authenticated;

insert into public.rooms (name, slug, type, description, base_price_pkr, max_guests, amenities, status)
values
  (
    'Economy Room',
    'economy-room',
    'economy_room',
    'Clean, comfortable room for budget-conscious guests who still need a secure, well-managed stay.',
    5500,
    2,
    array['Wi-Fi', 'Smart TV', 'AC', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    'Executive Room',
    'executive-room',
    'executive_room',
    'Quiet room suited to business visitors and short family stays, with reliable essentials and responsive support.',
    6500,
    2,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    'Deluxe Room',
    'deluxe-room',
    'deluxe_room',
    'A larger, well-maintained room with added comfort for families, medical visitors, and longer stays.',
    7500,
    3,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Dining access', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    'Studio Apartment',
    'studio-apartment',
    'studio',
    'Self-contained studio with practical home-style convenience for couples, business guests, and extended visits.',
    8500,
    3,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen access', 'Dining access', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    'Full Apartment',
    'full-apartment',
    'apartment',
    'Full serviced apartment for families and groups who need more space, privacy, and home-like comfort.',
    9500,
    5,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen', 'Dining area', 'Common lounge', 'Rooftop/outdoor sitting', 'CCTV/security', 'Backup power'],
    'active'
  )
on conflict (slug) do update
set name = excluded.name,
    type = excluded.type,
    description = excluded.description,
    base_price_pkr = excluded.base_price_pkr,
    max_guests = excluded.max_guests,
    amenities = excluded.amenities,
    status = excluded.status,
    updated_at = now();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('guest-documents', 'guest-documents', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf']),
  ('expense-receipts', 'expense-receipts', false, 10485760, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Guest document objects are visible to owners and management" on storage.objects;
create policy "Guest document objects are visible to owners and management"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'guest-documents'
  and (
    public.is_management()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Guests can upload own guest document objects" on storage.objects;
create policy "Guests can upload own guest document objects"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'guest-documents'
  and (
    public.is_management()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Guest document objects can be changed by owners and management" on storage.objects;
create policy "Guest document objects can be changed by owners and management"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'guest-documents'
  and (
    public.is_management()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (
  bucket_id = 'guest-documents'
  and (
    public.is_management()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

drop policy if exists "Management can delete guest document objects" on storage.objects;
create policy "Management can delete guest document objects"
on storage.objects
for delete
to authenticated
using (bucket_id = 'guest-documents' and public.is_management());

drop policy if exists "Super admins can read expense receipt objects" on storage.objects;
create policy "Super admins can read expense receipt objects"
on storage.objects
for select
to authenticated
using (bucket_id = 'expense-receipts' and public.is_super_admin());

drop policy if exists "Super admins can upload expense receipt objects" on storage.objects;
create policy "Super admins can upload expense receipt objects"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'expense-receipts' and public.is_super_admin());

drop policy if exists "Super admins can update expense receipt objects" on storage.objects;
create policy "Super admins can update expense receipt objects"
on storage.objects
for update
to authenticated
using (bucket_id = 'expense-receipts' and public.is_super_admin())
with check (bucket_id = 'expense-receipts' and public.is_super_admin());

drop policy if exists "Super admins can delete expense receipt objects" on storage.objects;
create policy "Super admins can delete expense receipt objects"
on storage.objects
for delete
to authenticated
using (bucket_id = 'expense-receipts' and public.is_super_admin());

commit;
