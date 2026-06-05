create extension if not exists "pg_cron" with schema "pg_catalog";

create extension if not exists "pg_net" with schema "public";


  create table "public"."matches" (
    "id" uuid not null default gen_random_uuid(),
    "external_id" integer not null,
    "stage" text not null,
    "group" text,
    "home_team_id" integer,
    "home_team_name" text,
    "away_team_id" integer,
    "away_team_name" text,
    "utc_date" timestamp with time zone not null,
    "status" text not null default 'SCHEDULED'::text,
    "home_score" integer,
    "away_score" integer,
    "winner" text,
    "minute" integer,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."matches" enable row level security;


  create table "public"."user_scores" (
    "user_id" uuid not null,
    "feature1_points" integer not null default 0,
    "feature2_points" integer not null default 0,
    "total_points" integer generated always as ((feature1_points + feature2_points)) stored,
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."user_scores" enable row level security;

CREATE UNIQUE INDEX matches_external_id_key ON public.matches USING btree (external_id);

CREATE UNIQUE INDEX matches_pkey ON public.matches USING btree (id);

CREATE UNIQUE INDEX user_scores_pkey ON public.user_scores USING btree (user_id);

alter table "public"."matches" add constraint "matches_pkey" PRIMARY KEY using index "matches_pkey";

alter table "public"."user_scores" add constraint "user_scores_pkey" PRIMARY KEY using index "user_scores_pkey";

alter table "public"."matches" add constraint "matches_external_id_key" UNIQUE using index "matches_external_id_key";

alter table "public"."user_scores" add constraint "user_scores_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."user_scores" validate constraint "user_scores_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin new.updated_at = now(); return new; end;
$function$
;

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

grant delete on table "public"."user_scores" to "anon";

grant insert on table "public"."user_scores" to "anon";

grant references on table "public"."user_scores" to "anon";

grant select on table "public"."user_scores" to "anon";

grant trigger on table "public"."user_scores" to "anon";

grant truncate on table "public"."user_scores" to "anon";

grant update on table "public"."user_scores" to "anon";

grant delete on table "public"."user_scores" to "authenticated";

grant insert on table "public"."user_scores" to "authenticated";

grant references on table "public"."user_scores" to "authenticated";

grant select on table "public"."user_scores" to "authenticated";

grant trigger on table "public"."user_scores" to "authenticated";

grant truncate on table "public"."user_scores" to "authenticated";

grant update on table "public"."user_scores" to "authenticated";

grant delete on table "public"."user_scores" to "service_role";

grant insert on table "public"."user_scores" to "service_role";

grant references on table "public"."user_scores" to "service_role";

grant select on table "public"."user_scores" to "service_role";

grant trigger on table "public"."user_scores" to "service_role";

grant truncate on table "public"."user_scores" to "service_role";

grant update on table "public"."user_scores" to "service_role";

CREATE TRIGGER matches_updated_at BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


