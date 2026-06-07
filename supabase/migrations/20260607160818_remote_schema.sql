drop policy "read user_scores" on "public"."user_scores";


  create table "public"."group_stage_prediction_picks" (
    "id" uuid not null default gen_random_uuid(),
    "prediction_id" uuid not null,
    "team_id" integer not null,
    "predicted_position" integer not null,
    "is_correct" boolean not null default false
      );


alter table "public"."group_stage_prediction_picks" enable row level security;


  create table "public"."group_stage_predictions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "group_name" text not null,
    "group_points" integer not null default 0,
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."group_stage_predictions" enable row level security;


  create table "public"."knockout_predictions" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "match_id" integer not null,
    "predicted_winner_id" integer not null,
    "is_correct" boolean not null default false,
    "points_awarded" integer not null default 0,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."knockout_predictions" enable row level security;


  create table "public"."knockout_round_points" (
    "stage" text not null,
    "points" integer not null
      );


alter table "public"."knockout_round_points" enable row level security;

alter table "public"."user_scores" drop column "feature1_points" CASCADE;

alter table "public"."user_scores" add column "group_stage_points" integer not null default 0;

alter table "public"."user_scores" add column "knockout_points" integer not null default 0;

alter table "public"."user_scores" add column "feature1_points" integer generated always as ((group_stage_points + knockout_points)) stored;

alter table "public"."user_scores" add column "total_points" integer generated always as ((group_stage_points + knockout_points + feature2_points)) stored;

alter table "public"."user_scores" alter column "updated_at" set not null;

CREATE UNIQUE INDEX group_stage_prediction_picks_pkey ON public.group_stage_prediction_picks USING btree (id);

CREATE INDEX group_stage_prediction_picks_prediction_id_idx ON public.group_stage_prediction_picks USING btree (prediction_id);

CREATE UNIQUE INDEX group_stage_predictions_pkey ON public.group_stage_predictions USING btree (id);

CREATE UNIQUE INDEX group_stage_predictions_user_group_key ON public.group_stage_predictions USING btree (user_id, group_name);

CREATE INDEX knockout_predictions_match_id_idx ON public.knockout_predictions USING btree (match_id);

CREATE UNIQUE INDEX knockout_predictions_pkey ON public.knockout_predictions USING btree (id);

CREATE INDEX knockout_predictions_user_id_idx ON public.knockout_predictions USING btree (user_id);

CREATE UNIQUE INDEX knockout_predictions_user_match_key ON public.knockout_predictions USING btree (user_id, match_id);

CREATE UNIQUE INDEX knockout_round_points_pkey ON public.knockout_round_points USING btree (stage);

CREATE UNIQUE INDEX prediction_picks_prediction_position_key ON public.group_stage_prediction_picks USING btree (prediction_id, predicted_position);

CREATE UNIQUE INDEX prediction_picks_prediction_team_key ON public.group_stage_prediction_picks USING btree (prediction_id, team_id);

alter table "public"."group_stage_prediction_picks" add constraint "group_stage_prediction_picks_pkey" PRIMARY KEY using index "group_stage_prediction_picks_pkey";

alter table "public"."group_stage_predictions" add constraint "group_stage_predictions_pkey" PRIMARY KEY using index "group_stage_predictions_pkey";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_pkey" PRIMARY KEY using index "knockout_predictions_pkey";

alter table "public"."knockout_round_points" add constraint "knockout_round_points_pkey" PRIMARY KEY using index "knockout_round_points_pkey";

alter table "public"."group_stage_prediction_picks" add constraint "group_stage_prediction_picks_predicted_position_check" CHECK (((predicted_position >= 1) AND (predicted_position <= 4))) not valid;

alter table "public"."group_stage_prediction_picks" validate constraint "group_stage_prediction_picks_predicted_position_check";

alter table "public"."group_stage_prediction_picks" add constraint "group_stage_prediction_picks_prediction_id_fkey" FOREIGN KEY (prediction_id) REFERENCES public.group_stage_predictions(id) ON DELETE CASCADE not valid;

alter table "public"."group_stage_prediction_picks" validate constraint "group_stage_prediction_picks_prediction_id_fkey";

alter table "public"."group_stage_prediction_picks" add constraint "group_stage_prediction_picks_team_id_fkey" FOREIGN KEY (team_id) REFERENCES public.teams(id) not valid;

alter table "public"."group_stage_prediction_picks" validate constraint "group_stage_prediction_picks_team_id_fkey";

alter table "public"."group_stage_prediction_picks" add constraint "prediction_picks_prediction_position_key" UNIQUE using index "prediction_picks_prediction_position_key";

alter table "public"."group_stage_prediction_picks" add constraint "prediction_picks_prediction_team_key" UNIQUE using index "prediction_picks_prediction_team_key";

alter table "public"."group_stage_predictions" add constraint "group_stage_predictions_user_group_key" UNIQUE using index "group_stage_predictions_user_group_key";

alter table "public"."group_stage_predictions" add constraint "group_stage_predictions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."group_stage_predictions" validate constraint "group_stage_predictions_user_id_fkey";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_match_id_fkey" FOREIGN KEY (match_id) REFERENCES public.matches(id) not valid;

alter table "public"."knockout_predictions" validate constraint "knockout_predictions_match_id_fkey";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_predicted_winner_id_fkey" FOREIGN KEY (predicted_winner_id) REFERENCES public.teams(id) not valid;

alter table "public"."knockout_predictions" validate constraint "knockout_predictions_predicted_winner_id_fkey";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."knockout_predictions" validate constraint "knockout_predictions_user_id_fkey";

alter table "public"."knockout_predictions" add constraint "knockout_predictions_user_match_key" UNIQUE using index "knockout_predictions_user_match_key";

grant delete on table "public"."group_stage_prediction_picks" to "anon";

grant insert on table "public"."group_stage_prediction_picks" to "anon";

grant references on table "public"."group_stage_prediction_picks" to "anon";

grant select on table "public"."group_stage_prediction_picks" to "anon";

grant trigger on table "public"."group_stage_prediction_picks" to "anon";

grant truncate on table "public"."group_stage_prediction_picks" to "anon";

grant update on table "public"."group_stage_prediction_picks" to "anon";

grant delete on table "public"."group_stage_prediction_picks" to "authenticated";

grant insert on table "public"."group_stage_prediction_picks" to "authenticated";

grant references on table "public"."group_stage_prediction_picks" to "authenticated";

grant select on table "public"."group_stage_prediction_picks" to "authenticated";

grant trigger on table "public"."group_stage_prediction_picks" to "authenticated";

grant truncate on table "public"."group_stage_prediction_picks" to "authenticated";

grant update on table "public"."group_stage_prediction_picks" to "authenticated";

grant delete on table "public"."group_stage_prediction_picks" to "service_role";

grant insert on table "public"."group_stage_prediction_picks" to "service_role";

grant references on table "public"."group_stage_prediction_picks" to "service_role";

grant select on table "public"."group_stage_prediction_picks" to "service_role";

grant trigger on table "public"."group_stage_prediction_picks" to "service_role";

grant truncate on table "public"."group_stage_prediction_picks" to "service_role";

grant update on table "public"."group_stage_prediction_picks" to "service_role";

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

grant delete on table "public"."knockout_round_points" to "anon";

grant insert on table "public"."knockout_round_points" to "anon";

grant references on table "public"."knockout_round_points" to "anon";

grant select on table "public"."knockout_round_points" to "anon";

grant trigger on table "public"."knockout_round_points" to "anon";

grant truncate on table "public"."knockout_round_points" to "anon";

grant update on table "public"."knockout_round_points" to "anon";

grant delete on table "public"."knockout_round_points" to "authenticated";

grant insert on table "public"."knockout_round_points" to "authenticated";

grant references on table "public"."knockout_round_points" to "authenticated";

grant select on table "public"."knockout_round_points" to "authenticated";

grant trigger on table "public"."knockout_round_points" to "authenticated";

grant truncate on table "public"."knockout_round_points" to "authenticated";

grant update on table "public"."knockout_round_points" to "authenticated";

grant delete on table "public"."knockout_round_points" to "service_role";

grant insert on table "public"."knockout_round_points" to "service_role";

grant references on table "public"."knockout_round_points" to "service_role";

grant select on table "public"."knockout_round_points" to "service_role";

grant trigger on table "public"."knockout_round_points" to "service_role";

grant truncate on table "public"."knockout_round_points" to "service_role";

grant update on table "public"."knockout_round_points" to "service_role";


