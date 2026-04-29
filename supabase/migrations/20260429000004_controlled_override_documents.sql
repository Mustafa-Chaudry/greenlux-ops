begin;

alter table public.guest_documents
  add column if not exists document_status text not null default 'pending';

do $$
begin
  alter table public.guest_documents
    add constraint guest_documents_document_status_check
    check (document_status in ('pending', 'verified', 'rejected'));
exception
  when duplicate_object then null;
end $$;

alter table public.guest_checkins
  add column if not exists issue_type text;

do $$
begin
  alter table public.guest_checkins
    add constraint guest_checkins_issue_type_check
    check (
      issue_type is null
      or issue_type in ('cnic_pending', 'payment_pending', 'missing_documents', 'guest_exception', 'other')
    );
exception
  when duplicate_object then null;
end $$;

create index if not exists guest_documents_status_idx
  on public.guest_documents(checkin_id, document_type, document_status);

create index if not exists guest_checkins_issue_type_idx
  on public.guest_checkins(issue_type);

create or replace function public.prevent_guest_document_status_changes()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_management(auth.uid()) or coalesce(auth.role(), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'INSERT' and new.document_status <> 'pending' then
    raise exception 'Guests cannot verify or reject documents.';
  end if;

  if tg_op = 'UPDATE' and new.document_status is distinct from old.document_status then
    raise exception 'Guests cannot update document verification status.';
  end if;

  return new;
end;
$$;

drop trigger if exists prevent_guest_document_status_changes on public.guest_documents;
create trigger prevent_guest_document_status_changes
before insert or update on public.guest_documents
for each row execute function public.prevent_guest_document_status_changes();

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
       or new.issue_type is not null
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
     or new.issue_type is distinct from old.issue_type
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

commit;
