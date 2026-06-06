create sequence "public"."group_standings_id_seq";


  create table "public"."group_standings" (
    "id" integer not null default nextval('public.group_standings_id_seq'::regclass),
    "team_api_id" integer not null,
    "group_name" text not null,
    "played" integer not null default 0,
    "won" integer not null default 0,
    "drawn" integer not null default 0,
    "lost" integer not null default 0,
    "goals_for" integer not null default 0,
    "goals_against" integer not null default 0,
    "goal_difference" integer generated always as ((goals_for - goals_against)) stored,
    "points" integer generated always as (((won * 3) + drawn)) stored,
    "position" integer not null default 0,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."group_standings" enable row level security;

alter sequence "public"."group_standings_id_seq" owned by "public"."group_standings"."id";

CREATE INDEX group_standings_group_name_idx ON public.group_standings USING btree (group_name);

CREATE UNIQUE INDEX group_standings_pkey ON public.group_standings USING btree (id);

CREATE UNIQUE INDEX group_standings_team_group_key ON public.group_standings USING btree (team_api_id, group_name);

alter table "public"."group_standings" add constraint "group_standings_pkey" PRIMARY KEY using index "group_standings_pkey";

alter table "public"."group_standings" add constraint "group_standings_team_api_id_fkey" FOREIGN KEY (team_api_id) REFERENCES public.teams(api_id) ON DELETE CASCADE not valid;

alter table "public"."group_standings" validate constraint "group_standings_team_api_id_fkey";

alter table "public"."group_standings" add constraint "group_standings_team_group_key" UNIQUE using index "group_standings_team_group_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.recalculate_group_standings()
 RETURNS void
 LANGUAGE sql
AS $function$

  -- 1. Upsert base stats (played/won/drawn/lost/gf/ga) from finished group matches
  insert into group_standings (team_api_id, group_name, played, won, drawn, lost, goals_for, goals_against)
  select
    team_api_id,
    group_name,
    count(*)                                          as played,
    count(*) filter (where result = 'WIN')            as won,
    count(*) filter (where result = 'DRAW')           as drawn,
    count(*) filter (where result = 'LOSS')           as lost,
    sum(gf)                                           as goals_for,
    sum(ga)                                           as goals_against
  from (
    -- Home team perspective
    select
      home_team_id                                    as team_api_id,
      "group"                                         as group_name,
      home_score                                      as gf,
      away_score                                      as ga,
      case
        when winner = 'HOME_TEAM' then 'WIN'
        when winner = 'DRAW'     then 'DRAW'
        else                          'LOSS'
      end                                             as result
    from matches
    where stage = 'GROUP_STAGE'
      and status = 'FINISHED'
      and home_score is not null
      and home_team_id is not null

    union all

    -- Away team perspective
    select
      away_team_id                                    as team_api_id,
      "group"                                         as group_name,
      away_score                                      as gf,
      home_score                                      as ga,
      case
        when winner = 'AWAY_TEAM' then 'WIN'
        when winner = 'DRAW'     then 'DRAW'
        else                          'LOSS'
      end                                             as result
    from matches
    where stage = 'GROUP_STAGE'
      and status = 'FINISHED'
      and away_score is not null
      and away_team_id is not null
  ) team_results
  group by team_api_id, group_name

  on conflict (team_api_id, group_name) do update set
    played        = excluded.played,
    won           = excluded.won,
    drawn         = excluded.drawn,
    lost          = excluded.lost,
    goals_for     = excluded.goals_for,
    goals_against = excluded.goals_against,
    updated_at    = now();

  -- 2. Ensure every team in the teams table has a row (0s for unplayed)
  insert into group_standings (team_api_id, group_name, played, won, drawn, lost, goals_for, goals_against)
  select api_id, group_name, 0, 0, 0, 0, 0, 0
  from teams
  where group_name is not null
  on conflict (team_api_id, group_name) do nothing;

  -- 3. Assign positions within each group
  --    Tiebreaker: points → goal_difference → goals_for (FIFA standard)
  update group_standings gs
  set position = ranked.pos
  from (
    select
      team_api_id,
      group_name,
      row_number() over (
        partition by group_name
        order by
          points          desc,
          goal_difference desc,
          goals_for       desc,
          team_api_id     asc   -- deterministic fallback
      ) as pos
    from group_standings
  ) ranked
  where gs.team_api_id = ranked.team_api_id
    and gs.group_name  = ranked.group_name;

$function$
;

grant delete on table "public"."group_standings" to "anon";

grant insert on table "public"."group_standings" to "anon";

grant references on table "public"."group_standings" to "anon";

grant select on table "public"."group_standings" to "anon";

grant trigger on table "public"."group_standings" to "anon";

grant truncate on table "public"."group_standings" to "anon";

grant update on table "public"."group_standings" to "anon";

grant delete on table "public"."group_standings" to "authenticated";

grant insert on table "public"."group_standings" to "authenticated";

grant references on table "public"."group_standings" to "authenticated";

grant select on table "public"."group_standings" to "authenticated";

grant trigger on table "public"."group_standings" to "authenticated";

grant truncate on table "public"."group_standings" to "authenticated";

grant update on table "public"."group_standings" to "authenticated";

grant delete on table "public"."group_standings" to "service_role";

grant insert on table "public"."group_standings" to "service_role";

grant references on table "public"."group_standings" to "service_role";

grant select on table "public"."group_standings" to "service_role";

grant trigger on table "public"."group_standings" to "service_role";

grant truncate on table "public"."group_standings" to "service_role";

grant update on table "public"."group_standings" to "service_role";


