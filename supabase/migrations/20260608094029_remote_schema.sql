
  create table "public"."score_predictions" (
    "user_id" uuid not null,
    "match_id" integer not null,
    "predicted_home" integer not null,
    "predicted_away" integer not null,
    "points_awarded" integer,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now()
      );


alter table "public"."score_predictions" enable row level security;

CREATE UNIQUE INDEX score_predictions_pkey ON public.score_predictions USING btree (user_id, match_id);

alter table "public"."score_predictions" add constraint "score_predictions_pkey" PRIMARY KEY using index "score_predictions_pkey";

alter table "public"."score_predictions" add constraint "score_predictions_match_id_fkey" FOREIGN KEY (match_id) REFERENCES public.matches(id) not valid;

alter table "public"."score_predictions" validate constraint "score_predictions_match_id_fkey";

alter table "public"."score_predictions" add constraint "score_predictions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE not valid;

alter table "public"."score_predictions" validate constraint "score_predictions_user_id_fkey";

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


  create policy "users manage own predictions"
  on "public"."score_predictions"
  as permissive
  for all
  to public
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));



