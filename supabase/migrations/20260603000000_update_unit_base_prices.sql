begin;

update public.rooms
set base_price_pkr = case unit_number
  when 1 then 10000
  when 2 then 10000
  when 3 then 10000
  when 4 then 11000
  when 8 then 11000
  else base_price_pkr
end,
updated_at = now()
where unit_number in (1, 2, 3, 4, 8);

commit;
