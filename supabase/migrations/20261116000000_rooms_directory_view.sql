begin;

-- Step 1 of 2 (safe to apply any time; changes nothing that exists today).
--
-- The "Public can read active rooms" policy lets anyone, signed in or not, read
-- every column of public.rooms: cleaning status, the staff user id that last
-- changed it, and the internal base price. The public website does not read this
-- table at all (it uses static content), and the only non-staff reader is the
-- guest dashboard, which needs the unit label of the guest's assigned room.
--
-- This view exposes just that label. Like guest_checkins_guest_view it runs with
-- the owner's rights, so it keeps working after step 2 removes the public policy.
create or replace view public.rooms_directory as
select id, unit_number, name
from public.rooms;

revoke all on public.rooms_directory from public, anon;
grant select on public.rooms_directory to authenticated;

comment on view public.rooms_directory is
  'Unit labels only (id, unit number, name) for signed-in guests. Operational room state stays on public.rooms, readable by management only.';

commit;
