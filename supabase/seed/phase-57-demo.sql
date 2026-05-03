-- GreenLux Phase 5.7 demo seed data.
-- Use only for local or staging environments. Do not run on production.

begin;

-- Fixed demo users. Password for local/staging only: GreenLuxDemo57!
insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    '00000000-0000-0000-0000-000000057101',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'manager.phase57@greenlux.test',
    crypt('GreenLuxDemo57!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Phase 5.7 Manager","phone":"+92300057101"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000057102',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin.phase57@greenlux.test',
    crypt('GreenLuxDemo57!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Phase 5.7 Admin","phone":"+92300057102"}'::jsonb,
    now(),
    now()
  ),
  (
    '00000000-0000-0000-0000-000000057103',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'superadmin.phase57@greenlux.test',
    crypt('GreenLuxDemo57!', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Phase 5.7 Super Admin","phone":"+92300057103"}'::jsonb,
    now(),
    now()
  )
on conflict (id) do update
set email = excluded.email,
    encrypted_password = excluded.encrypted_password,
    raw_app_meta_data = excluded.raw_app_meta_data,
    raw_user_meta_data = excluded.raw_user_meta_data,
    updated_at = now();

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
select
  id,
  id,
  id::text,
  jsonb_build_object('sub', id::text, 'email', email),
  'email',
  now(),
  now(),
  now()
from auth.users
where email in (
  'manager.phase57@greenlux.test',
  'admin.phase57@greenlux.test',
  'superadmin.phase57@greenlux.test'
)
on conflict (provider, provider_id) do nothing;

insert into public.users_profile (id, full_name, phone, email, role)
values
  ('00000000-0000-0000-0000-000000057101', 'Phase 5.7 Manager', '+92300057101', 'manager.phase57@greenlux.test', 'manager'),
  ('00000000-0000-0000-0000-000000057102', 'Phase 5.7 Admin', '+92300057102', 'admin.phase57@greenlux.test', 'admin'),
  ('00000000-0000-0000-0000-000000057103', 'Phase 5.7 Super Admin', '+92300057103', 'superadmin.phase57@greenlux.test', 'super_admin')
on conflict (id) do update
set full_name = excluded.full_name,
    phone = excluded.phone,
    email = excluded.email,
    role = excluded.role,
    updated_at = now();

alter table public.guest_checkins disable trigger prevent_guest_internal_checkin_changes;

insert into public.guest_checkins (
  id,
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
  agreed_room_rate_pkr,
  advance_paid_amount_pkr,
  total_expected_amount_pkr,
  amount_paid_pkr,
  payment_status,
  status,
  assigned_room_id,
  special_requests,
  internal_notes,
  guest_tag,
  cnic_verified,
  payment_verified,
  issue_type
)
values
  (
    '00000000-0000-0000-0000-000000057301',
    'admin_created',
    'Sara Malik',
    '+923001110001',
    null,
    null,
    'Model Town, Lahore',
    'Lahore, Pakistan',
    current_date,
    current_date + 2,
    '15:30',
    2,
    'family_visit',
    'direct_whatsapp_call',
    false,
    'cash',
    6500,
    2000,
    13000,
    2000,
    'partial',
    'under_review',
    (select id from public.rooms where slug = 'executive-room' limit 1),
    'Arriving with spouse. CNIC will be shared at desk.',
    'Phase 5.7 demo: arrival today with missing CNIC.',
    'issue',
    false,
    false,
    'cnic_pending'
  ),
  (
    '00000000-0000-0000-0000-000000057302',
    'admin_created',
    'Omar Khan',
    '+923001110002',
    'omar.phase57@example.com',
    '35202-1234567-1',
    'F-8, Islamabad',
    'Islamabad, Pakistan',
    current_date - 2,
    current_date,
    '12:00',
    1,
    'business',
    'booking_com',
    true,
    'bank_transfer',
    7500,
    7500,
    15000,
    15000,
    'paid',
    'checked_in',
    (select id from public.rooms where slug = 'deluxe-room' limit 1),
    'Needs checkout reminder after breakfast.',
    'Phase 5.7 demo: departure today.',
    'repeat',
    true,
    true,
    null
  ),
  (
    '00000000-0000-0000-0000-000000057303',
    'admin_created',
    'Hina Ahmed',
    '+923001110003',
    'hina.phase57@example.com',
    '61101-7654321-4',
    'Gulberg, Lahore',
    'Lahore, Pakistan',
    current_date - 1,
    current_date + 1,
    '18:00',
    3,
    'medical',
    'direct_whatsapp_call',
    false,
    'online_payment',
    12000,
    10000,
    24000,
    10000,
    'partial',
    'checked_in',
    (select id from public.rooms where slug = 'full-apartment' limit 1),
    'Hospital visit. Payment balance due before checkout.',
    'Phase 5.7 demo: unpaid balance exception.',
    'issue',
    true,
    false,
    'payment_pending'
  ),
  (
    '00000000-0000-0000-0000-000000057304',
    'admin_created',
    'Bilal Shah',
    '+923001110004',
    'bilal.phase57@example.com',
    '42101-2222222-9',
    'Clifton, Karachi',
    'Karachi, Pakistan',
    current_date,
    current_date + 3,
    '14:00',
    1,
    'business',
    'airbnb',
    true,
    'bank_transfer',
    8500,
    25500,
    25500,
    25500,
    'paid',
    'checked_in',
    (select id from public.rooms where slug = 'studio-apartment' limit 1),
    'Quiet room preferred.',
    'Phase 5.7 demo: fully verified guest.',
    'vip',
    true,
    true,
    null
  ),
  (
    '00000000-0000-0000-0000-000000057305',
    'admin_created',
    'Noor Fatima',
    '+923001110005',
    'noor.phase57@example.com',
    '37405-3333333-2',
    'Cantt, Rawalpindi',
    'Rawalpindi, Pakistan',
    current_date - 3,
    current_date + 4,
    '16:30',
    2,
    'tourism',
    'referral',
    true,
    'cash',
    6500,
    26000,
    45500,
    26000,
    'partial',
    'checked_in',
    (select id from public.rooms where slug = 'economy-room' limit 1),
    'Extended stay; collect balance before final night.',
    'Phase 5.7 demo: stay extended from original checkout to current extended checkout.',
    'repeat',
    true,
    true,
    null
  )
on conflict (id) do update
set guest_type = excluded.guest_type,
    full_name = excluded.full_name,
    phone = excluded.phone,
    email = excluded.email,
    cnic_passport_number = excluded.cnic_passport_number,
    address = excluded.address,
    city_country_from = excluded.city_country_from,
    check_in_date = excluded.check_in_date,
    check_out_date = excluded.check_out_date,
    estimated_arrival_time = excluded.estimated_arrival_time,
    number_of_guests = excluded.number_of_guests,
    purpose_of_visit = excluded.purpose_of_visit,
    booking_source = excluded.booking_source,
    has_stayed_before = excluded.has_stayed_before,
    payment_method = excluded.payment_method,
    agreed_room_rate_pkr = excluded.agreed_room_rate_pkr,
    advance_paid_amount_pkr = excluded.advance_paid_amount_pkr,
    total_expected_amount_pkr = excluded.total_expected_amount_pkr,
    amount_paid_pkr = excluded.amount_paid_pkr,
    payment_status = excluded.payment_status,
    status = excluded.status,
    assigned_room_id = excluded.assigned_room_id,
    special_requests = excluded.special_requests,
    internal_notes = excluded.internal_notes,
    guest_tag = excluded.guest_tag,
    cnic_verified = excluded.cnic_verified,
    payment_verified = excluded.payment_verified,
    issue_type = excluded.issue_type,
    updated_at = now();

alter table public.guest_checkins enable trigger prevent_guest_internal_checkin_changes;

insert into public.guest_charges (
  id,
  guest_checkin_id,
  charge_type,
  description,
  amount_pkr,
  quantity,
  is_paid,
  payment_method,
  charged_at,
  created_by,
  notes
)
values
  (
    '00000000-0000-0000-0000-000000057401',
    '00000000-0000-0000-0000-000000057304',
    'breakfast',
    'Breakfast',
    700,
    3,
    true,
    'cash',
    now() - interval '4 hours',
    '00000000-0000-0000-0000-000000057102',
    'Paid at front desk.'
  ),
  (
    '00000000-0000-0000-0000-000000057402',
    '00000000-0000-0000-0000-000000057305',
    'extra_bed',
    'Extra bed for extended stay',
    1500,
    2,
    false,
    null,
    now() - interval '2 hours',
    '00000000-0000-0000-0000-000000057102',
    'Collect with remaining room balance.'
  ),
  (
    '00000000-0000-0000-0000-000000057403',
    '00000000-0000-0000-0000-000000057303',
    'tea',
    'Tea service',
    250,
    4,
    false,
    null,
    now() - interval '1 hour',
    '00000000-0000-0000-0000-000000057101',
    'Unpaid folio service.'
  ),
  (
    '00000000-0000-0000-0000-000000057404',
    '00000000-0000-0000-0000-000000057304',
    'other',
    'Voided charge placeholder',
    0,
    1,
    false,
    null,
    now() - interval '30 minutes',
    '00000000-0000-0000-0000-000000057102',
    'Phase 5.7 demo: current schema has no void flag yet, so this uses amount 0 plus audit log.'
  )
on conflict (id) do update
set guest_checkin_id = excluded.guest_checkin_id,
    charge_type = excluded.charge_type,
    description = excluded.description,
    amount_pkr = excluded.amount_pkr,
    quantity = excluded.quantity,
    is_paid = excluded.is_paid,
    payment_method = excluded.payment_method,
    charged_at = excluded.charged_at,
    created_by = excluded.created_by,
    notes = excluded.notes,
    updated_at = now();

insert into public.expenses (
  id,
  category,
  amount_pkr,
  expense_date,
  paid_to,
  payment_method,
  related_room_id,
  notes,
  created_by
)
values
  (
    '00000000-0000-0000-0000-000000057501',
    'maintenance',
    4500,
    current_date,
    'Ali Electric Works',
    'cash',
    (select id from public.rooms where slug = 'deluxe-room' limit 1),
    'Linked to resolved AC repair demo maintenance item.',
    '00000000-0000-0000-0000-000000057103'
  )
on conflict (id) do update
set category = excluded.category,
    amount_pkr = excluded.amount_pkr,
    expense_date = excluded.expense_date,
    paid_to = excluded.paid_to,
    payment_method = excluded.payment_method,
    related_room_id = excluded.related_room_id,
    notes = excluded.notes,
    created_by = excluded.created_by,
    updated_at = now();

insert into public.room_maintenance_logs (
  id,
  room_id,
  issue_title,
  issue_description,
  status,
  cost_pkr,
  reported_date,
  resolved_date,
  notes,
  created_by,
  actual_cost_pkr,
  vendor_paid_to,
  payment_method,
  linked_expense_id
)
values
  (
    '00000000-0000-0000-0000-000000057601',
    (select id from public.rooms where slug = 'executive-room' limit 1),
    'Bathroom exhaust noise',
    'Guest reported rattling exhaust fan. Needs inspection, no cost recorded yet.',
    'reported',
    null,
    current_date,
    null,
    'Phase 5.7 demo: maintenance without expense.',
    '00000000-0000-0000-0000-000000057101',
    null,
    null,
    null,
    null
  ),
  (
    '00000000-0000-0000-0000-000000057602',
    (select id from public.rooms where slug = 'deluxe-room' limit 1),
    'AC capacitor replaced',
    'AC cooling issue resolved by vendor.',
    'resolved',
    4500,
    current_date - 1,
    current_date,
    'Phase 5.7 demo: maintenance with linked expense.',
    '00000000-0000-0000-0000-000000057102',
    4500,
    'Ali Electric Works',
    'cash',
    '00000000-0000-0000-0000-000000057501'
  )
on conflict (id) do update
set room_id = excluded.room_id,
    issue_title = excluded.issue_title,
    issue_description = excluded.issue_description,
    status = excluded.status,
    cost_pkr = excluded.cost_pkr,
    reported_date = excluded.reported_date,
    resolved_date = excluded.resolved_date,
    notes = excluded.notes,
    created_by = excluded.created_by,
    actual_cost_pkr = excluded.actual_cost_pkr,
    vendor_paid_to = excluded.vendor_paid_to,
    payment_method = excluded.payment_method,
    linked_expense_id = excluded.linked_expense_id,
    updated_at = now();

insert into public.audit_logs (
  id,
  actor_user_id,
  action,
  entity_type,
  entity_id,
  metadata
)
values
  (
    '00000000-0000-0000-0000-000000057701',
    '00000000-0000-0000-0000-000000057102',
    'stay_extended',
    'guest_checkin',
    '00000000-0000-0000-0000-000000057305',
    '{"reason":"guest requested longer stay","source":"phase_57_seed"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000057702',
    '00000000-0000-0000-0000-000000057102',
    'charge_voided_placeholder',
    'guest_charge',
    '00000000-0000-0000-0000-000000057404',
    '{"reason":"wrong charge entered","schema_note":"void flag not implemented yet","source":"phase_57_seed"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000057703',
    '00000000-0000-0000-0000-000000057103',
    'maintenance_expense_linked',
    'room_maintenance_log',
    '00000000-0000-0000-0000-000000057602',
    '{"expense_id":"00000000-0000-0000-0000-000000057501","source":"phase_57_seed"}'::jsonb
  )
on conflict (id) do update
set actor_user_id = excluded.actor_user_id,
    action = excluded.action,
    entity_type = excluded.entity_type,
    entity_id = excluded.entity_id,
    metadata = excluded.metadata;

commit;
