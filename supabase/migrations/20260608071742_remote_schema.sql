alter table "public"."matches" drop constraint "matches_last_match_away_id_fkey";

alter table "public"."matches" drop constraint "matches_last_match_away_team_id_fkey";

alter table "public"."matches" drop constraint "matches_last_match_home_id_fkey";

alter table "public"."matches" drop constraint "matches_last_match_home_team_id_fkey";

alter table "public"."matches" drop column "last_match_away_id";

alter table "public"."matches" drop column "last_match_away_team_id";

alter table "public"."matches" drop column "last_match_home_id";

alter table "public"."matches" drop column "last_match_home_team_id";

alter table "public"."matches" add column "next_match_id" integer;

alter table "public"."matches" add column "next_match_slot" text;

alter table "public"."matches" add constraint "matches_next_match_id_fkey" FOREIGN KEY (next_match_id) REFERENCES public.matches(id) not valid;

alter table "public"."matches" validate constraint "matches_next_match_id_fkey";


  create policy "Users can insert own knockout predictions"
  on "public"."knockout_predictions"
  as permissive
  for insert
  to public
with check ((auth.uid() = user_id));



  create policy "Users can read own knockout predictions"
  on "public"."knockout_predictions"
  as permissive
  for select
  to public
using ((auth.uid() = user_id));



  create policy "Users can update own predictions before kickoff"
  on "public"."knockout_predictions"
  as permissive
  for update
  to public
using ((auth.uid() = user_id))
with check (((auth.uid() = user_id) AND (EXISTS ( SELECT 1
   FROM public.matches m
  WHERE ((m.id = knockout_predictions.match_id) AND (m.status = 'TIMED'::public.match_status))))));



