create policy "matches are readable by authenticated users"
on "public"."matches"
as permissive
for select
to authenticated
using (true);
