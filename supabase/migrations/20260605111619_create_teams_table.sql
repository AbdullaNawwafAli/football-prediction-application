create sequence "public"."teams_id_seq";


  create table "public"."teams" (
    "id" integer not null default nextval('public.teams_id_seq'::regclass),
    "api_id" integer not null,
    "name" text not null,
    "short_name" text,
    "tla" text,
    "crest_url" text,
    "group_name" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."teams" enable row level security;

alter sequence "public"."teams_id_seq" owned by "public"."teams"."id";

CREATE UNIQUE INDEX teams_api_id_key ON public.teams USING btree (api_id);

CREATE INDEX teams_group_name_idx ON public.teams USING btree (group_name);

CREATE UNIQUE INDEX teams_pkey ON public.teams USING btree (id);

alter table "public"."teams" add constraint "teams_pkey" PRIMARY KEY using index "teams_pkey";

alter table "public"."teams" add constraint "teams_api_id_key" UNIQUE using index "teams_api_id_key";

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


  create policy "Service role can manage teams"
  on "public"."teams"
  as permissive
  for all
  to service_role
using (true);



  create policy "Teams are viewable by authenticated users"
  on "public"."teams"
  as permissive
  for select
  to authenticated
using (true);



