begin;

-- Phase 6 hardening: make the shared updated_at trigger function use a fixed
-- search path. The body only touches the trigger NEW row and built-in now().
alter function public.set_updated_at()
set search_path = '';

-- Trigger-only SECURITY DEFINER functions should not be directly callable via
-- the Data API roles. Their table/auth triggers can continue to execute them.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.prevent_guest_internal_checkin_changes() from public, anon, authenticated;
revoke execute on function public.prevent_unauthorized_role_change() from public, anon, authenticated;

-- RLS helper functions are still required by policies and must remain callable
-- by authenticated users. Remove anonymous/default execution paths first, then
-- explicitly preserve authenticated access.
revoke execute on function public.is_management(uuid) from public, anon;
revoke execute on function public.is_super_admin(uuid) from public, anon;
revoke execute on function public.owns_checkin(uuid, uuid) from public, anon;

grant execute on function public.is_management(uuid) to authenticated;
grant execute on function public.is_super_admin(uuid) to authenticated;
grant execute on function public.owns_checkin(uuid, uuid) to authenticated;

-- Anonymous room browsing should not need to call role-checking helper
-- functions. Split public active-room reads from management all-room reads.
drop policy if exists "Active rooms are public and all rooms are visible to management" on public.rooms;

create policy "Public can read active rooms"
on public.rooms
for select
to anon, authenticated
using (status = 'active');

create policy "Management can read all rooms"
on public.rooms
for select
to authenticated
using (public.is_management());

-- Management view is safe to run as invoker because management already has a
-- base-table SELECT policy on public.guest_checkins via public.is_management().
-- Guard the option for older Postgres versions where security_invoker views are
-- unavailable.
do $$
begin
  if current_setting('server_version_num')::integer >= 150000 then
    execute 'alter view public.guest_checkins_management_view set (security_invoker = true)';
  else
    raise notice 'Skipping guest_checkins_management_view security_invoker: requires Postgres 15 or newer.';
  end if;
end $$;

-- public.guest_checkins_guest_view is intentionally deferred. Making it
-- security_invoker now would require a guest-owned SELECT policy on the base
-- public.guest_checkins table, which could expose full internal check-in rows
-- to guests. Fixing that safely needs a redesigned guest-facing projection or
-- RPC that preserves the limited guest-visible column set.

commit;
