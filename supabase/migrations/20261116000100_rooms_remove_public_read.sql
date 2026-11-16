begin;

-- Step 2 of 2. Apply ONLY after the app version that reads public.rooms_directory
-- on the guest dashboard is deployed. Applied earlier, guests would see "Assigned"
-- instead of their unit name (no data loss, no error).
--
-- After this, public.rooms is readable by management only, through the existing
-- "Management can read all rooms" policy.
drop policy if exists "Public can read active rooms" on public.rooms;

-- Rollback:
--   create policy "Public can read active rooms" on public.rooms
--   for select to anon, authenticated using (status = 'active');

commit;
