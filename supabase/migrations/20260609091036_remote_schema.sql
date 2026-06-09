drop policy "Users can select own prediction picks" on "public"."group_stage_prediction_picks";

drop policy "Users can select own group predictions" on "public"."group_stage_predictions";

alter table "public"."matches" add column "matchday" integer;

-- Drop total_points first since it depends on feature2_points
alter table "public"."user_scores" drop column "total_points";

alter table "public"."user_scores" drop column "feature2_points";

alter table "public"."user_scores" add column "final" integer not null default 0;

alter table "public"."user_scores" add column "last_16" integer not null default 0;

alter table "public"."user_scores" add column "last_32" integer not null default 0;

alter table "public"."user_scores" add column "matchday1" integer not null default 0;

alter table "public"."user_scores" add column "matchday2" integer not null default 0;

alter table "public"."user_scores" add column "matchday3" integer not null default 0;

alter table "public"."user_scores" add column "qf" integer not null default 0;

alter table "public"."user_scores" add column "sf" integer not null default 0;

alter table "public"."user_scores" add column "third" integer not null default 0;

alter table "public"."user_scores" add column "feature2_points" integer generated always as (
  matchday1 + matchday2 + matchday3 + last_32 + last_16 + qf + sf + final + third
) stored;

-- Recreate total_points as a generated column using the new full expression
alter table "public"."user_scores" add column "total_points" integer generated always as (
  group_stage_points + knockout_points + matchday1 + matchday2 + matchday3 + last_32 + last_16 + qf + sf + final + third
) stored;


create policy "Authenticated users can read all prediction picks"
  on "public"."group_stage_prediction_picks"
  as permissive
  for select
  to authenticated
  using (true);

create policy "Authenticated users can read all group predictions"
  on "public"."group_stage_predictions"
  as permissive
  for select
  to authenticated
  using (true);

create policy "read user_scores"
  on "public"."user_scores"
  as permissive
  for select
  to authenticated
  using (true);