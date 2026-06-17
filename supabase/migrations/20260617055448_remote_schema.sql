CREATE INDEX idx_ko_preds_match ON public.knockout_predictions USING btree (match_id);

CREATE INDEX idx_krp_stage ON public.knockout_round_points USING btree (stage);

CREATE INDEX idx_matches_status ON public.matches USING btree (status);

CREATE INDEX idx_picks_team ON public.group_stage_prediction_picks USING btree (team_id);

CREATE INDEX idx_score_predictions_match ON public.score_predictions USING btree (match_id);

CREATE INDEX idx_standings_team ON public.group_standings USING btree (team_id);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.award_feature2_points()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
declare
  v_scored bigint;
  v_users  bigint;
begin
  -- 1. Score predictions for active matches, in place
  with active as (
    select id,
           coalesce(full_time_home, half_time_home) as ah,
           coalesce(full_time_away, half_time_away) as aa
    from matches
    where status not in
      ('TIMED','SCHEDULED','SUSPENDED','POSTPONED','CANCELLED')
  ),
  upd as (
    update score_predictions sp
    set points_awarded = case
          when a.ah is null or a.aa is null then 0
          when sign(a.ah - a.aa) = sign(sp.predicted_home - sp.predicted_away)
            then case when sp.predicted_home = a.ah
                       and sp.predicted_away = a.aa then 5 else 3 end
          else 0
        end,
        updated_at = now()
    from active a
    where sp.match_id = a.id
    returning 1
  )
  select count(*) into v_scored from upd;

  -- 2. Aggregate per user into the stage columns
  with active as (
    select id, stage, matchday from matches
    where status not in
      ('TIMED','SCHEDULED','SUSPENDED','POSTPONED','CANCELLED')
  ),
  agg as (
    select sp.user_id,
      coalesce(sum(sp.points_awarded) filter (where a.stage='GROUP_STAGE' and a.matchday=1),0) as matchday1,
      coalesce(sum(sp.points_awarded) filter (where a.stage='GROUP_STAGE' and a.matchday=2),0) as matchday2,
      coalesce(sum(sp.points_awarded) filter (where a.stage='GROUP_STAGE' and a.matchday=3),0) as matchday3,
      coalesce(sum(sp.points_awarded) filter (where a.stage='LAST_32'),0)        as last_32,
      coalesce(sum(sp.points_awarded) filter (where a.stage='LAST_16'),0)        as last_16,
      coalesce(sum(sp.points_awarded) filter (where a.stage='QUARTER_FINALS'),0) as qf,
      coalesce(sum(sp.points_awarded) filter (where a.stage='SEMI_FINALS'),0)    as sf,
      coalesce(sum(sp.points_awarded) filter (where a.stage='FINAL'),0)          as final,
      coalesce(sum(sp.points_awarded) filter (where a.stage='THIRD_PLACE'),0)    as third
    from score_predictions sp
    join active a on a.id = sp.match_id
    group by sp.user_id
  ),
  ins as (
    insert into user_scores as us
      (user_id, matchday1, matchday2, matchday3, last_32, last_16, qf, sf, final, third, updated_at)
    select user_id, matchday1, matchday2, matchday3, last_32, last_16, qf, sf, final, third, now()
    from agg
    on conflict (user_id) do update set
      matchday1 = excluded.matchday1,
      matchday2 = excluded.matchday2,
      matchday3 = excluded.matchday3,
      last_32   = excluded.last_32,
      last_16   = excluded.last_16,
      qf        = excluded.qf,
      sf        = excluded.sf,
      final     = excluded.final,
      third     = excluded.third,
      updated_at = excluded.updated_at
    returning 1
  )
  select count(*) into v_users from ins;

  return json_build_object('predictions_scored', v_scored, 'users_updated', v_users);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.award_group_stage_points()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
declare
  v_picks       bigint;
  v_predictions bigint;
  v_users       bigint;
begin
  -- 1. Mark each pick correct/incorrect against current standings
  with upd_picks as (
    update group_stage_prediction_picks p
    set is_correct = (gs.group_position is not null
                      and gs.group_position = p.predicted_position)
    from group_stage_prediction_picks p2
    left join group_standings gs on gs.team_id = p2.team_id
    where p.id = p2.id
    returning p.id
  )
  select count(*) into v_picks from upd_picks;

  -- 2. Sum group_points per prediction and write them back
  with pts as (
    select p.prediction_id,
      coalesce(sum(
        case
          when gs.group_position is not null
           and gs.group_position = p.predicted_position
          then case when p.predicted_position = 1 then 3 else 1 end
          else 0
        end
      ),0) as group_points
    from group_stage_prediction_picks p
    left join group_standings gs on gs.team_id = p.team_id
    group by p.prediction_id
  ),
  upd_preds as (
    update group_stage_predictions gp
    set group_points = pts.group_points,
        updated_at   = now()
    from pts
    where gp.id = pts.prediction_id
    returning gp.id
  )
  select count(*) into v_predictions from upd_preds;

  -- 3. Roll group_points up into user_scores
  with grp as (
    select user_id, coalesce(sum(group_points),0) as group_stage_points
    from group_stage_predictions
    group by user_id
  ),
  ins as (
    insert into user_scores as us (user_id, group_stage_points, updated_at)
    select user_id, group_stage_points, now()
    from grp
    on conflict (user_id) do update set
      group_stage_points = excluded.group_stage_points,
      updated_at         = excluded.updated_at
    returning 1
  )
  select count(*) into v_users from ins;

  return json_build_object(
    'picks_evaluated', v_picks,
    'predictions_updated', v_predictions,
    'users_updated', v_users
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.award_knockout_points()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
declare
  v_predictions bigint;
  v_users       bigint;
begin
  -- 1. Score each knockout prediction in place
  with scored as (
    select kp.id,
      ( m.status in ('FINISHED','AWARDED')
        and m.winner_id is not null
        and m.winner_id = kp.predicted_winner_id ) as is_correct,
      case
        when m.status in ('FINISHED','AWARDED')
         and m.winner_id is not null
         and m.winner_id = kp.predicted_winner_id
        then coalesce(krp.points, 0)
        else 0
      end as points_awarded
    from knockout_predictions kp
    join matches m on m.id = kp.match_id
    left join knockout_round_points krp on krp.stage = m.stage
  ),
  upd as (
    update knockout_predictions kp
    set is_correct     = s.is_correct,
        points_awarded = s.points_awarded,
        updated_at     = now()
    from scored s
    where kp.id = s.id
    returning kp.id
  )
  select count(*) into v_predictions from upd;

  -- 2. Roll knockout_points up per user
  with agg as (
    select user_id, coalesce(sum(points_awarded),0) as knockout_points
    from knockout_predictions
    group by user_id
  ),
  ins as (
    insert into user_scores as us (user_id, knockout_points, updated_at)
    select user_id, knockout_points, now()
    from agg
    on conflict (user_id) do update set
      knockout_points = excluded.knockout_points,
      updated_at      = excluded.updated_at
    returning 1
  )
  select count(*) into v_users from ins;

  return json_build_object(
    'predictions_evaluated', v_predictions,
    'users_updated', v_users
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.recalculate_standings()
 RETURNS json
 LANGUAGE plpgsql
AS $function$
declare
  v_updated   bigint;
  v_awardable boolean;
  v_award     json := null;
begin
  -- 1. Build standings from group-stage matches and upsert
  with gm as (
    select * from matches
    where stage = 'GROUP_STAGE'
      and group_name is not null
      and home_team_id is not null
      and away_team_id is not null
  ),
  persp as (
    -- one row per team per match, from that team's own perspective
    select home_team_id as team_id, group_name,
           home_booking_score as booking, status,
           full_time_home as gf, full_time_away as ga
    from gm
    union all
    select away_team_id, group_name,
           away_booking_score, status,
           full_time_away, full_time_home
    from gm
  ),
  flat as (
    select
      team_id, group_name,
      coalesce(booking, 0) as booking_points,
      (status in ('IN_PLAY','PAUSED','FINISHED','AWARDED')) as countable,
      (status in ('IN_PLAY','PAUSED','FINISHED','AWARDED')
        and gf is not null and ga is not null) as scored,
      gf, ga
    from persp
  ),
  agg as (
    select
      team_id,
      min(group_name) as group_name,
      sum(booking_points) as booking_points,
      sum((countable)::int) as played,
      sum((scored and gf > ga)::int) as won,
      sum((scored and gf = ga)::int) as drawn,
      sum((scored and gf < ga)::int) as lost,
      sum(case when scored then gf else 0 end) as goals_for,
      sum(case when scored then ga else 0 end) as goals_against,
      sum(case when scored then gf else 0 end)
        - sum(case when scored then ga else 0 end) as goal_difference,
      sum((scored and gf > ga)::int) * 3
        + sum((scored and gf = ga)::int) as points
    from flat
    group by team_id
  ),
  ranked as (
    select
      a.*,
      coalesce(t.name, 'Unknown') as team_name,
      row_number() over (
        partition by a.group_name
        order by a.points desc,
                 a.goal_difference desc,
                 a.goals_for desc,
                 a.booking_points asc,
                 coalesce(t.name, 'Unknown') asc
      ) as group_position
    from agg a
    left join teams t on t.id = a.team_id
  ),
  upserted as (
    insert into group_standings as gs (
      team_id, team_name, group_name, played, won, drawn, lost,
      goals_for, goals_against, goal_difference, points,
      booking_points, group_position
    )
    select
      team_id, team_name, group_name, played, won, drawn, lost,
      goals_for, goals_against, goal_difference, points,
      booking_points, group_position
    from ranked
    on conflict (team_id) do update set
      team_name       = excluded.team_name,
      group_name      = excluded.group_name,
      played          = excluded.played,
      won             = excluded.won,
      drawn           = excluded.drawn,
      lost            = excluded.lost,
      goals_for       = excluded.goals_for,
      goals_against   = excluded.goals_against,
      goal_difference = excluded.goal_difference,
      points          = excluded.points,
      booking_points  = excluded.booking_points,
      group_position  = excluded.group_position
    returning 1
  )
  select count(*) into v_updated from upserted;

  -- 2. Award group-stage points only if any group match is IN_PLAY or FINISHED
  select exists (
    select 1 from matches
    where stage = 'GROUP_STAGE' and status in ('IN_PLAY','FINISHED')
  ) into v_awardable;

  if v_awardable then
    v_award := award_group_stage_points();
  end if;

  return json_build_object(
    'standings_updated', v_updated,
    'award', v_award
  );
end;
$function$
;

CREATE OR REPLACE FUNCTION public.group_stage_open()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select now() < (select min(utc_date) from matches where stage = 'GROUP_STAGE');
$function$
;

CREATE OR REPLACE FUNCTION public.knockout_stage_open()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select now() < (select min(utc_date) from matches where stage <> 'GROUP_STAGE');
$function$
;

CREATE OR REPLACE FUNCTION public.match_open(match_ext_id integer)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1 from matches m
    where m.id = match_ext_id and now() < m.utc_date
  );
$function$
;

grant delete on table "public"."profiles" to "anon";

grant insert on table "public"."profiles" to "anon";

grant select on table "public"."profiles" to "anon";

grant update on table "public"."profiles" to "anon";

grant delete on table "public"."profiles" to "authenticated";

grant insert on table "public"."profiles" to "authenticated";

grant select on table "public"."profiles" to "authenticated";

grant update on table "public"."profiles" to "authenticated";

grant delete on table "public"."profiles" to "service_role";

grant insert on table "public"."profiles" to "service_role";

grant select on table "public"."profiles" to "service_role";

grant update on table "public"."profiles" to "service_role";


