set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.group_stage_open()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select now() < (
    select min(utc_date) from matches where stage = 'GROUP_STAGE'
  ) - interval '1 hour';
$function$
;

CREATE OR REPLACE FUNCTION public.knockout_stage_open()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select now() < (
    select min(utc_date) from matches where stage <> 'GROUP_STAGE'
  ) - interval '1 hour';
$function$
;

CREATE OR REPLACE FUNCTION public.match_open(match_ext_id integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1 from matches m
    where m.external_id = match_ext_id
      and now() < m.utc_date - interval '1 hour'
  );
$function$
;

CREATE OR REPLACE FUNCTION public.rollup_user_scores()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  -- Feature 1: group stage + knockout
  update user_scores us
  set feature1_points = coalesce(f1.total, 0),
      updated_at = now()
  from (
    select user_id, sum(points) as total
    from (
      select user_id, points from group_stage_predictions
      union all
      select user_id, points from knockout_predictions
    ) combined
    group by user_id
  ) f1
  where us.user_id = f1.user_id;

  -- Feature 2: match score predictions
  update user_scores us
  set feature2_points = coalesce(f2.total, 0),
      updated_at = now()
  from (
    select user_id, sum(points) as total
    from score_predictions
    group by user_id
  ) f2
  where us.user_id = f2.user_id;
$function$
;

CREATE OR REPLACE FUNCTION public.seed_user_scores()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
begin
  insert into user_scores (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$function$
;


  create policy "insert own group prediction"
  on "public"."group_stage_predictions"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = user_id) AND public.group_stage_open()));



  create policy "read own group predictions"
  on "public"."group_stage_predictions"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "update own group prediction"
  on "public"."group_stage_predictions"
  as permissive
  for update
  to authenticated
using (((auth.uid() = user_id) AND public.group_stage_open()))
with check (((auth.uid() = user_id) AND public.group_stage_open()));



  create policy "insert own knockout prediction"
  on "public"."knockout_predictions"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = user_id) AND public.knockout_stage_open()));



  create policy "read own knockout predictions"
  on "public"."knockout_predictions"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "update own knockout prediction"
  on "public"."knockout_predictions"
  as permissive
  for update
  to authenticated
using (((auth.uid() = user_id) AND public.knockout_stage_open()))
with check (((auth.uid() = user_id) AND public.knockout_stage_open()));



  create policy "read matches"
  on "public"."matches"
  as permissive
  for select
  to authenticated
using (true);



  create policy "insert own score prediction"
  on "public"."score_predictions"
  as permissive
  for insert
  to authenticated
with check (((auth.uid() = user_id) AND public.match_open(match_external_id)));



  create policy "read own score predictions"
  on "public"."score_predictions"
  as permissive
  for select
  to authenticated
using ((auth.uid() = user_id));



  create policy "update own score prediction"
  on "public"."score_predictions"
  as permissive
  for update
  to authenticated
using (((auth.uid() = user_id) AND public.match_open(match_external_id)))
with check (((auth.uid() = user_id) AND public.match_open(match_external_id)));



  create policy "read user_scores"
  on "public"."user_scores"
  as permissive
  for select
  to authenticated
using (true);


CREATE TRIGGER profiles_seed_user_scores AFTER INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.seed_user_scores();


