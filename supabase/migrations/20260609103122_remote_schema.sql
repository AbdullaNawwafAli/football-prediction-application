alter table "public"."matches" add column "next_match_loser_id" integer;

alter table "public"."matches" add column "next_match_loser_slot" text;

alter table "public"."matches" add constraint "matches_next_match_loser_id_fkey" FOREIGN KEY (next_match_loser_id) REFERENCES public.matches(id) not valid;

alter table "public"."matches" validate constraint "matches_next_match_loser_id_fkey";


  create policy "Authenticated users can view all knockout predictions"
  on "public"."knockout_predictions"
  as permissive
  for select
  to authenticated
using (true);



