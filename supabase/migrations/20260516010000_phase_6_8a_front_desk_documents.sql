begin;

alter type public.booking_source add value if not exists 'agent';
alter type public.document_type add value if not exists 'supporting_document';

commit;
