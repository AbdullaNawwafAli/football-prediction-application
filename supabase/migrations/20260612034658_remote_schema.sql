alter table "public"."group_standings" add column "team_name" text;


  create policy "teams_read"
  on "public"."teams"
  as permissive
  for select
  to authenticated
using (true);



