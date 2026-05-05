begin;

alter table public.rooms
  add column if not exists unit_number integer;

do $$
begin
  alter table public.rooms
    add constraint rooms_unit_number_positive
    check (unit_number is null or unit_number > 0);
exception
  when duplicate_object then null;
end $$;

do $$
begin
  alter table public.rooms
    add constraint rooms_unit_number_unique
    unique (unit_number);
exception
  when duplicate_object then null;
end $$;

update public.rooms
set unit_number = 1,
    name = 'Studio 1',
    slug = 'studio-1',
    type = 'studio',
    description = 'Club Class Studio with clean, secure, serviced-stay comfort for couples, business visitors, and longer stays.',
    base_price_pkr = 8500,
    max_guests = 3,
    amenities = array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen access', 'Dining access', 'CCTV/security', 'Backup power'],
    status = 'active',
    updated_at = now()
where slug = 'studio-apartment'
  and not exists (select 1 from public.rooms existing where existing.unit_number = 1 and existing.id <> public.rooms.id);

update public.rooms
set unit_number = 3,
    name = 'Apartment 3',
    slug = 'apartment-3',
    type = 'apartment',
    description = 'One-Bed Apartment for families, medical visitors, and longer stays needing privacy and home-like comfort.',
    base_price_pkr = 9500,
    max_guests = 4,
    amenities = array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen', 'Dining area', 'Common lounge', 'CCTV/security', 'Backup power'],
    status = 'active',
    updated_at = now()
where slug = 'full-apartment'
  and not exists (select 1 from public.rooms existing where existing.unit_number = 3 and existing.id <> public.rooms.id);

update public.rooms
set unit_number = 5,
    name = 'Room 5',
    slug = 'room-5',
    type = 'deluxe_room',
    description = 'Deluxe Room with added comfort for families, medical visitors, and longer stays.',
    base_price_pkr = 7500,
    max_guests = 3,
    amenities = array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Dining access', 'CCTV/security', 'Backup power'],
    status = 'active',
    updated_at = now()
where slug = 'deluxe-room'
  and not exists (select 1 from public.rooms existing where existing.unit_number = 5 and existing.id <> public.rooms.id);

update public.rooms
set unit_number = 6,
    name = 'Room 6',
    slug = 'room-6',
    type = 'executive_room',
    description = 'Executive Room suited to business visitors and short family stays with reliable essentials.',
    base_price_pkr = 6500,
    max_guests = 2,
    amenities = array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'CCTV/security', 'Backup power'],
    status = 'active',
    updated_at = now()
where slug = 'executive-room'
  and not exists (select 1 from public.rooms existing where existing.unit_number = 6 and existing.id <> public.rooms.id);

update public.rooms
set unit_number = 9,
    name = 'Room 9',
    slug = 'room-9',
    type = 'economy_room',
    description = 'Economy Room for budget-conscious guests who still need a clean, secure, well-managed stay.',
    base_price_pkr = 5500,
    max_guests = 2,
    amenities = array['Wi-Fi', 'Smart TV', 'AC', 'CCTV/security', 'Backup power'],
    status = 'active',
    updated_at = now()
where slug = 'economy-room'
  and not exists (select 1 from public.rooms existing where existing.unit_number = 9 and existing.id <> public.rooms.id);

insert into public.rooms (unit_number, name, slug, type, description, base_price_pkr, max_guests, amenities, status)
values
  (
    1,
    'Studio 1',
    'studio-1',
    'studio',
    'Club Class Studio with clean, secure, serviced-stay comfort for couples, business visitors, and longer stays.',
    8500,
    3,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen access', 'Dining access', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    2,
    'Studio 2',
    'studio-2',
    'studio',
    'Club Class Studio with calm, private, serviced-stay comfort for couples, business visitors, and longer stays.',
    8500,
    3,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen access', 'Dining access', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    3,
    'Apartment 3',
    'apartment-3',
    'apartment',
    'One-Bed Apartment for families, medical visitors, and longer stays needing privacy and home-like comfort.',
    9500,
    4,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen', 'Dining area', 'Common lounge', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    4,
    'Apartment 4',
    'apartment-4',
    'apartment',
    'Split-Level Apartment with extra space for families and longer stays.',
    9500,
    5,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen', 'Dining area', 'Common lounge', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    5,
    'Room 5',
    'room-5',
    'deluxe_room',
    'Deluxe Room with added comfort for families, medical visitors, and longer stays.',
    7500,
    3,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Dining access', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    6,
    'Room 6',
    'room-6',
    'executive_room',
    'Executive Room suited to business visitors and short family stays with reliable essentials.',
    6500,
    2,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    7,
    'Room 7',
    'room-7',
    'deluxe_room',
    'Deluxe Room with a quiet, well-maintained setup for families and short-stay guests.',
    7500,
    3,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Dining access', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    8,
    'Apartment 8',
    'apartment-8',
    'apartment',
    'Split-Level Apartment. Temporary operational mapping for Unit 8 until the final inventory naming is confirmed.',
    9500,
    5,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'Kitchen', 'Dining area', 'Common lounge', 'CCTV/security', 'Backup power', 'Temporary mapping'],
    'active'
  ),
  (
    9,
    'Room 9',
    'room-9',
    'economy_room',
    'Economy Room for budget-conscious guests who still need a clean, secure, well-managed stay.',
    5500,
    2,
    array['Wi-Fi', 'Smart TV', 'AC', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    10,
    'Room 10',
    'room-10',
    'executive_room',
    'Executive Room for business guests, short family stays, and visitors needing dependable essentials.',
    6500,
    2,
    array['Wi-Fi', 'Smart TV', 'AC', 'Refrigerator', 'CCTV/security', 'Backup power'],
    'active'
  ),
  (
    11,
    'Budget Room 11',
    'budget-room-11',
    'economy_room',
    'Budget Room for simple, clean, secure stays with responsive GreenLux management.',
    5500,
    2,
    array['Wi-Fi', 'Smart TV', 'AC', 'CCTV/security', 'Backup power'],
    'active'
  )
on conflict (unit_number) do update
set name = excluded.name,
    slug = excluded.slug,
    type = excluded.type,
    description = excluded.description,
    base_price_pkr = excluded.base_price_pkr,
    max_guests = excluded.max_guests,
    amenities = excluded.amenities,
    status = excluded.status,
    updated_at = now();

create index if not exists rooms_unit_number_idx
  on public.rooms(unit_number);

commit;
