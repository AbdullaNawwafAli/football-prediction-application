
  create policy "Anyone can read knockoutlock"
  on "public"."knockoutlock"
  as permissive
  for select
  to authenticated, anon
using (true);



