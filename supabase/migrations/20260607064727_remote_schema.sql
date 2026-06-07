create type "public"."match_duration" as enum ('REGULAR', 'EXTRA_TIME', 'PENALTY_SHOOTOUT');

create type "public"."match_status" as enum ('SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED', 'EXTRA_TIME', 'PENALTY_SHOOTOUT', 'FINISHED', 'SUSPENDED', 'POSTPONED', 'CANCELLED', 'AWARDED');


  create table "public"."group_standings" (
    "team_id" integer not null,
    "group_name" text not null,
    "played" integer not null default 0,
    "won" integer not null default 0,
    "drawn" integer not null default 0,
    "lost" integer not null default 0,
    "goals_for" integer not null default 0,
    "goals_against" integer not null default 0,
    "goal_difference" integer not null default 0,
    "points" integer not null default 0,
    "group_position" integer,
    "booking_points" integer not null default 0
      );


alter table "public"."group_standings" enable row level security;


  create table "public"."matches" (
    "id" integer not null,
    "utc_date" timestamp with time zone not null,
    "stage" text not null,
    "group_name" text,
    "home_team_id" integer,
    "away_team_id" integer,
    "duration" public.match_duration,
    "full_time_home" integer,
    "full_time_away" integer,
    "half_time_home" integer,
    "half_time_away" integer,
    "winner_id" integer,
    "home_booking_score" integer,
    "away_booking_score" integer,
    "next_match_id" integer,
    "status" public.match_status
      );


alter table "public"."matches" enable row level security;


  create table "public"."teams" (
    "id" integer not null,
    "name" text not null,
    "short_name" text,
    "tla" text,
    "crest_url" text,
    "group_name" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."teams" enable row level security;

CREATE INDEX group_standings_group_name_idx ON public.group_standings USING btree (group_name);

CREATE UNIQUE INDEX group_standings_pkey ON public.group_standings USING btree (team_id);

CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id);

CREATE INDEX teams_group_name_idx ON public.teams USING btree (group_name);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

alter table "public"."group_standings" add constraint "group_standings_pkey" PRIMARY KEY using index "group_standings_pkey";

alter table "public"."matches" add constraint "matches_pkey" PRIMARY KEY using index "matches_pkey";

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."group_standings" add constraint "group_standings_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) not valid;

alter table "public"."group_standings" validate constraint "group_standings_team_id_fkey";

alter table "public"."matches" add constraint "matches_away_team_id_fkey" FOREIGN KEY (away_team_id) REFERENCES public.teams(id) not valid;

alter table "public"."matches" validate constraint "matches_away_team_id_fkey";

alter table "public"."matches" add constraint "matches_home_team_id_fkey" FOREIGN KEY (home_team_id) REFERENCES public.teams(id) not valid;

alter table "public"."matches" validate constraint "matches_home_team_id_fkey";

alter table "public"."matches" add constraint "matches_next_match_id_fkey" FOREIGN KEY (next_match_id) REFERENCES public.matches(id) not valid;

alter table "public"."matches" validate constraint "matches_next_match_id_fkey";

alter table "public"."matches" add constraint "matches_winner_id_fkey" FOREIGN KEY (winner_id) REFERENCES public.teams(id) not valid;

alter table "public"."matches" validate constraint "matches_winner_id_fkey";

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

grant delete on table "public"."matches" to "anon";

grant insert on table "public"."matches" to "anon";

grant references on table "public"."matches" to "anon";

grant select on table "public"."matches" to "anon";

grant trigger on table "public"."matches" to "anon";

grant truncate on table "public"."matches" to "anon";

grant update on table "public"."matches" to "anon";

grant delete on table "public"."matches" to "authenticated";

grant insert on table "public"."matches" to "authenticated";

grant references on table "public"."matches" to "authenticated";

grant select on table "public"."matches" to "authenticated";

grant trigger on table "public"."matches" to "authenticated";

grant truncate on table "public"."matches" to "authenticated";

grant update on table "public"."matches" to "authenticated";

grant delete on table "public"."matches" to "service_role";

grant insert on table "public"."matches" to "service_role";

grant references on table "public"."matches" to "service_role";

grant select on table "public"."matches" to "service_role";

grant trigger on table "public"."matches" to "service_role";

grant truncate on table "public"."matches" to "service_role";

grant update on table "public"."matches" to "service_role";

grant delete on table "public"."teams" to "anon";

grant insert on table "public"."teams" to "anon";

grant references on table "public"."teams" to "anon";

grant select on table "public"."teams" to "anon";

grant trigger on table "public"."teams" to "anon";

grant truncate on table "public"."teams" to "anon";

grant update on table "public"."teams" to "anon";

grant delete on table "public"."teams" to "authenticated";

grant insert on table "public"."teams" to "authenticated";

grant references on table "public"."teams" to "authenticated";

grant select on table "public"."teams" to "authenticated";

grant trigger on table "public"."teams" to "authenticated";

grant truncate on table "public"."teams" to "authenticated";

grant update on table "public"."teams" to "authenticated";

grant delete on table "public"."teams" to "service_role";

grant insert on table "public"."teams" to "service_role";

grant references on table "public"."teams" to "service_role";

grant select on table "public"."teams" to "service_role";

grant trigger on table "public"."teams" to "service_role";

grant truncate on table "public"."teams" to "service_role";

grant update on table "public"."teams" to "service_role";


