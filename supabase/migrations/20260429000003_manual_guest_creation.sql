begin;

do $$
begin
  create type public.guest_type as enum ('self_registered', 'admin_created');
exception
  when duplicate_object then null;
end $$;

alter table public.guest_checkins
  add column if not exists guest_type public.guest_type not null default 'self_registered';

alter table public.guest_checkins
  alter column email drop not null,
  alter column cnic_passport_number drop not null;

create index if not exists guest_checkins_guest_type_idx
  on public.guest_checkins(guest_type);

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
       or new.total_expected_amount_pkr is not null
       or new.amount_paid_pkr is not null
       or new.payment_status <> 'pending'
       or new.status <> 'submitted'
       or new.guest_type <> 'self_registered'
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
     or new.total_expected_amount_pkr is distinct from old.total_expected_amount_pkr
     or new.amount_paid_pkr is distinct from old.amount_paid_pkr
     or new.payment_status is distinct from old.payment_status
     or new.status is distinct from old.status
     or new.guest_type is distinct from old.guest_type
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

drop view if exists public.guest_checkins_guest_view;

create view public.guest_checkins_guest_view
as
select
  id,
  guest_user_id,
  guest_type,
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
  has_stayed_before,
  payment_method,
  advance_paid_amount_pkr,
  payment_status,
  status,
  assigned_room_id,
  special_requests,
  cnic_verified,
  payment_verified,
  created_at,
  updated_at
from public.guest_checkins
where guest_user_id = auth.uid();

grant select on public.guest_checkins_guest_view to authenticated;

drop view if exists public.guest_checkins_management_view;

create view public.guest_checkins_management_view
as
select *
from public.guest_checkins
where public.is_management();

grant select on public.guest_checkins_management_view to authenticated;

commit;
