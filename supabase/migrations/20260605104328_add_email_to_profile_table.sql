alter table "public"."profiles" add column "email" text not null;

alter table "public"."profiles" alter column "avatar_url" set not null;

alter table "public"."profiles" alter column "created_at" set not null;

alter table "public"."profiles" alter column "favorite_team" set not null;

alter table "public"."profiles" alter column "updated_at" set not null;


