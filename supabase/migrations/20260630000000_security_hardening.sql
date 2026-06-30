begin;

-- Revoke execute on is_management from anon.
-- Unauthenticated callers can probe any UUID to discover whether it belongs
-- to a management-role account (the function returns a boolean, not an error).
-- The rooms SELECT policy that calls is_management() still works correctly for
-- anon because auth.uid() is NULL for unauthenticated requests, so the function
-- returns false regardless of whether the grant exists.
revoke execute on function public.is_management(uuid) from anon;

commit;
