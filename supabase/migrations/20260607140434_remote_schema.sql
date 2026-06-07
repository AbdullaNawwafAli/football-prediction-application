alter table "public"."matches" drop constraint "matches_next_match_id_fkey";

alter table "public"."matches" drop column "next_match_id";

alter table "public"."matches" add column "last_match_away_id" integer;

alter table "public"."matches" add column "last_match_away_team_id" integer;

alter table "public"."matches" add column "last_match_home_id" integer;

alter table "public"."matches" add column "last_match_home_team_id" integer;

alter table "public"."matches" add constraint "matches_last_match_away_id_fkey" FOREIGN KEY (last_match_away_id) REFERENCES public.matches(id) not valid;

alter table "public"."matches" validate constraint "matches_last_match_away_id_fkey";

alter table "public"."matches" add constraint "matches_last_match_away_team_id_fkey" FOREIGN KEY (last_match_away_team_id) REFERENCES public.teams(id) not valid;

alter table "public"."matches" validate constraint "matches_last_match_away_team_id_fkey";

alter table "public"."matches" add constraint "matches_last_match_home_id_fkey" FOREIGN KEY (last_match_home_id) REFERENCES public.matches(id) not valid;

alter table "public"."matches" validate constraint "matches_last_match_home_id_fkey";

alter table "public"."matches" add constraint "matches_last_match_home_team_id_fkey" FOREIGN KEY (last_match_home_team_id) REFERENCES public.teams(id) not valid;

alter table "public"."matches" validate constraint "matches_last_match_home_team_id_fkey";


