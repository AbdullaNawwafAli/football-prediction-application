alter table "public"."profiles" add column "rick_rolled" boolean;


  create policy "Users can update own rick_rolled"
  on "public"."profiles"
  as permissive
  for update
  to public
using ((auth.uid() = id))
with check ((auth.uid() = id));



