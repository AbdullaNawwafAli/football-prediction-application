
  create table "public"."group_stage_predictions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "group" text not null,
    "predicted_order" integer[] not null,
    "points" integer not null default 0,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."group_stage_predictions" enable row level security;


  create table "public"."knockout_predictions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "match_external_id" integer not null,
    "predicted_winner" text not null,
    "points" integer not null default 0,
    "last_calculated_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."knockout_predictions" enable row level security;


  create table "public"."score_predictions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "match_external_id" integer not null,
    "predicted_home" integer not null,
    "predicted_away" integer not null,
    "points" integer not null default 0,
    "last_calculated_at" timestamp with time zone,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter table "public"."score_predictions" enable row level security;

CREATE UNIQUE INDEX group_stage_predictions_pkey ON public.group_stage_predictions USING btree (id);

CREATE UNIQUE INDEX group_stage_predictions_user_id_group_key ON public.group_stage_predictions USING btree (user_id, "group");

CREATE INDEX group_stage_predictions_user_idx ON public.group_stage_predictions USING btree (user_id);

CREATE INDEX knockout_predictions_match_idx ON public.knockout_predictions USING btree (match_external_id);

CREATE UNIQUE INDEX knockout_predictions_pkey ON public.knockout_predictions USING btree (id);

CREATE UNIQUE INDEX knockout_predictions_user_id_match_external_id_key ON public.knockout_predictions USING btree (user_id, match_external_id);

CREATE INDEX knockout_predictions_user_idx ON public.knockout_predictions USING btree (user_id);

CREATE INDEX score_predictions_match_idx ON public.score_predictions USING btree (match_external_id);

CREATE UNIQUE INDEX score_predictions_pkey ON public.score_predictions USING btree (id);

CREATE UNIQUE INDEX score_predictions_user_id_match_external_id_key ON public.score_predictions USING btree (user_id, match_external_id);

CREATE INDEX score_predictions_user_idx ON public.score_predictions USING btree (user_id);

alter table "public"."group_stage_predictions" add constraint "group_stage_predictions_pkey" PRIMARY KEY using index "group_stage_predictions_pkey";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_pkey" PRIMARY KEY using index "knockout_predictions_pkey";

alter table "public"."score_predictions" add constraint "score_predictions_pkey" PRIMARY KEY using index "score_predictions_pkey";

alter table "public"."group_stage_predictions" add constraint "group_stage_predictions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."group_stage_predictions" validate constraint "group_stage_predictions_user_id_fkey";

alter table "public"."group_stage_predictions" add constraint "group_stage_predictions_user_id_group_key" UNIQUE using index "group_stage_predictions_user_id_group_key";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_match_external_id_fkey" FOREIGN KEY (match_external_id) REFERENCES public.matches(external_id) ON DELETE CASCADE not valid;

alter table "public"."knockout_predictions" validate constraint "knockout_predictions_match_external_id_fkey";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_predicted_winner_check" CHECK ((predicted_winner = ANY (ARRAY['HOME_TEAM'::text, 'AWAY_TEAM'::text]))) not valid;

alter table "public"."knockout_predictions" validate constraint "knockout_predictions_predicted_winner_check";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."knockout_predictions" validate constraint "knockout_predictions_user_id_fkey";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_user_id_match_external_id_key" UNIQUE using index "knockout_predictions_user_id_match_external_id_key";

alter table "public"."score_predictions" add constraint "score_predictions_match_external_id_fkey" FOREIGN KEY (match_external_id) REFERENCES public.matches(external_id) ON DELETE CASCADE not valid;

alter table "public"."score_predictions" validate constraint "score_predictions_match_external_id_fkey";

alter table "public"."score_predictions" add constraint "score_predictions_predicted_away_check" CHECK ((predicted_away >= 0)) not valid;

alter table "public"."score_predictions" validate constraint "score_predictions_predicted_away_check";

alter table "public"."score_predictions" add constraint "score_predictions_predicted_home_check" CHECK ((predicted_home >= 0)) not valid;

alter table "public"."score_predictions" validate constraint "score_predictions_predicted_home_check";

alter table "public"."score_predictions" add constraint "score_predictions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."score_predictions" validate constraint "score_predictions_user_id_fkey";

alter table "public"."score_predictions" add constraint "score_predictions_user_id_match_external_id_key" UNIQUE using index "score_predictions_user_id_match_external_id_key";

grant delete on table "public"."group_stage_predictions" to "anon";

grant insert on table "public"."group_stage_predictions" to "anon";

grant references on table "public"."group_stage_predictions" to "anon";

grant select on table "public"."group_stage_predictions" to "anon";

grant trigger on table "public"."group_stage_predictions" to "anon";

grant truncate on table "public"."group_stage_predictions" to "anon";

grant update on table "public"."group_stage_predictions" to "anon";

grant delete on table "public"."group_stage_predictions" to "authenticated";

grant insert on table "public"."group_stage_predictions" to "authenticated";

grant references on table "public"."group_stage_predictions" to "authenticated";

grant select on table "public"."group_stage_predictions" to "authenticated";

grant trigger on table "public"."group_stage_predictions" to "authenticated";

grant truncate on table "public"."group_stage_predictions" to "authenticated";

grant update on table "public"."group_stage_predictions" to "authenticated";

grant delete on table "public"."group_stage_predictions" to "service_role";

grant insert on table "public"."group_stage_predictions" to "service_role";

grant references on table "public"."group_stage_predictions" to "service_role";

grant select on table "public"."group_stage_predictions" to "service_role";

grant trigger on table "public"."group_stage_predictions" to "service_role";

grant truncate on table "public"."group_stage_predictions" to "service_role";

grant update on table "public"."group_stage_predictions" to "service_role";

grant delete on table "public"."knockout_predictions" to "anon";

grant insert on table "public"."knockout_predictions" to "anon";

grant references on table "public"."knockout_predictions" to "anon";

grant select on table "public"."knockout_predictions" to "anon";

grant trigger on table "public"."knockout_predictions" to "anon";

grant truncate on table "public"."knockout_predictions" to "anon";

grant update on table "public"."knockout_predictions" to "anon";

grant delete on table "public"."knockout_predictions" to "authenticated";

grant insert on table "public"."knockout_predictions" to "authenticated";

grant references on table "public"."knockout_predictions" to "authenticated";

grant select on table "public"."knockout_predictions" to "authenticated";

grant trigger on table "public"."knockout_predictions" to "authenticated";

grant truncate on table "public"."knockout_predictions" to "authenticated";

grant update on table "public"."knockout_predictions" to "authenticated";

grant delete on table "public"."knockout_predictions" to "service_role";

grant insert on table "public"."knockout_predictions" to "service_role";

grant references on table "public"."knockout_predictions" to "service_role";

grant select on table "public"."knockout_predictions" to "service_role";

grant trigger on table "public"."knockout_predictions" to "service_role";

grant truncate on table "public"."knockout_predictions" to "service_role";

grant update on table "public"."knockout_predictions" to "service_role";

grant delete on table "public"."score_predictions" to "anon";

grant insert on table "public"."score_predictions" to "anon";

grant references on table "public"."score_predictions" to "anon";

grant select on table "public"."score_predictions" to "anon";

grant trigger on table "public"."score_predictions" to "anon";

grant truncate on table "public"."score_predictions" to "anon";

grant update on table "public"."score_predictions" to "anon";

grant delete on table "public"."score_predictions" to "authenticated";

grant insert on table "public"."score_predictions" to "authenticated";

grant references on table "public"."score_predictions" to "authenticated";

grant select on table "public"."score_predictions" to "authenticated";

grant trigger on table "public"."score_predictions" to "authenticated";

grant truncate on table "public"."score_predictions" to "authenticated";

grant update on table "public"."score_predictions" to "authenticated";

grant delete on table "public"."score_predictions" to "service_role";

grant insert on table "public"."score_predictions" to "service_role";

grant references on table "public"."score_predictions" to "service_role";

grant select on table "public"."score_predictions" to "service_role";

grant trigger on table "public"."score_predictions" to "service_role";

grant truncate on table "public"."score_predictions" to "service_role";

grant update on table "public"."score_predictions" to "service_role";

CREATE TRIGGER group_stage_predictions_updated_at BEFORE UPDATE ON public.group_stage_predictions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER knockout_predictions_updated_at BEFORE UPDATE ON public.knockout_predictions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER score_predictions_updated_at BEFORE UPDATE ON public.score_predictions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


