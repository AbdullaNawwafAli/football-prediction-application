drop trigger if exists "group_stage_predictions_updated_at" on "public"."group_stage_predictions";

drop trigger if exists "knockout_predictions_updated_at" on "public"."knockout_predictions";

drop trigger if exists "matches_updated_at" on "public"."matches";

drop trigger if exists "score_predictions_updated_at" on "public"."score_predictions";

drop policy "insert own group prediction" on "public"."group_stage_predictions";

drop policy "read own group predictions" on "public"."group_stage_predictions";

drop policy "update own group prediction" on "public"."group_stage_predictions";

drop policy "insert own knockout prediction" on "public"."knockout_predictions";

drop policy "read own knockout predictions" on "public"."knockout_predictions";

drop policy "update own knockout prediction" on "public"."knockout_predictions";

drop policy "read matches" on "public"."matches";

drop policy "insert own score prediction" on "public"."score_predictions";

drop policy "read own score predictions" on "public"."score_predictions";

drop policy "update own score prediction" on "public"."score_predictions";

drop policy "Service role can manage teams" on "public"."teams";

drop policy "Teams are viewable by authenticated users" on "public"."teams";

revoke delete on table "public"."group_stage_predictions" from "anon";

revoke insert on table "public"."group_stage_predictions" from "anon";

revoke references on table "public"."group_stage_predictions" from "anon";

revoke select on table "public"."group_stage_predictions" from "anon";

revoke trigger on table "public"."group_stage_predictions" from "anon";

revoke truncate on table "public"."group_stage_predictions" from "anon";

revoke update on table "public"."group_stage_predictions" from "anon";

revoke delete on table "public"."group_stage_predictions" from "authenticated";

revoke insert on table "public"."group_stage_predictions" from "authenticated";

revoke references on table "public"."group_stage_predictions" from "authenticated";

revoke select on table "public"."group_stage_predictions" from "authenticated";

revoke trigger on table "public"."group_stage_predictions" from "authenticated";

revoke truncate on table "public"."group_stage_predictions" from "authenticated";

revoke update on table "public"."group_stage_predictions" from "authenticated";

revoke delete on table "public"."group_stage_predictions" from "service_role";

revoke insert on table "public"."group_stage_predictions" from "service_role";

revoke references on table "public"."group_stage_predictions" from "service_role";

revoke select on table "public"."group_stage_predictions" from "service_role";

revoke trigger on table "public"."group_stage_predictions" from "service_role";

revoke truncate on table "public"."group_stage_predictions" from "service_role";

revoke update on table "public"."group_stage_predictions" from "service_role";

revoke delete on table "public"."group_standings" from "anon";

revoke insert on table "public"."group_standings" from "anon";

revoke references on table "public"."group_standings" from "anon";

revoke select on table "public"."group_standings" from "anon";

revoke trigger on table "public"."group_standings" from "anon";

revoke truncate on table "public"."group_standings" from "anon";

revoke update on table "public"."group_standings" from "anon";

revoke delete on table "public"."group_standings" from "authenticated";

revoke insert on table "public"."group_standings" from "authenticated";

revoke references on table "public"."group_standings" from "authenticated";

revoke select on table "public"."group_standings" from "authenticated";

revoke trigger on table "public"."group_standings" from "authenticated";

revoke truncate on table "public"."group_standings" from "authenticated";

revoke update on table "public"."group_standings" from "authenticated";

revoke delete on table "public"."group_standings" from "service_role";

revoke insert on table "public"."group_standings" from "service_role";

revoke references on table "public"."group_standings" from "service_role";

revoke select on table "public"."group_standings" from "service_role";

revoke trigger on table "public"."group_standings" from "service_role";

revoke truncate on table "public"."group_standings" from "service_role";

revoke update on table "public"."group_standings" from "service_role";

revoke delete on table "public"."knockout_predictions" from "anon";

revoke insert on table "public"."knockout_predictions" from "anon";

revoke references on table "public"."knockout_predictions" from "anon";

revoke select on table "public"."knockout_predictions" from "anon";

revoke trigger on table "public"."knockout_predictions" from "anon";

revoke truncate on table "public"."knockout_predictions" from "anon";

revoke update on table "public"."knockout_predictions" from "anon";

revoke delete on table "public"."knockout_predictions" from "authenticated";

revoke insert on table "public"."knockout_predictions" from "authenticated";

revoke references on table "public"."knockout_predictions" from "authenticated";

revoke select on table "public"."knockout_predictions" from "authenticated";

revoke trigger on table "public"."knockout_predictions" from "authenticated";

revoke truncate on table "public"."knockout_predictions" from "authenticated";

revoke update on table "public"."knockout_predictions" from "authenticated";

revoke delete on table "public"."knockout_predictions" from "service_role";

revoke insert on table "public"."knockout_predictions" from "service_role";

revoke references on table "public"."knockout_predictions" from "service_role";

revoke select on table "public"."knockout_predictions" from "service_role";

revoke trigger on table "public"."knockout_predictions" from "service_role";

revoke truncate on table "public"."knockout_predictions" from "service_role";

revoke update on table "public"."knockout_predictions" from "service_role";

revoke delete on table "public"."matches" from "anon";

revoke insert on table "public"."matches" from "anon";

revoke references on table "public"."matches" from "anon";

revoke select on table "public"."matches" from "anon";

revoke trigger on table "public"."matches" from "anon";

revoke truncate on table "public"."matches" from "anon";

revoke update on table "public"."matches" from "anon";

revoke delete on table "public"."matches" from "authenticated";

revoke insert on table "public"."matches" from "authenticated";

revoke references on table "public"."matches" from "authenticated";

revoke select on table "public"."matches" from "authenticated";

revoke trigger on table "public"."matches" from "authenticated";

revoke truncate on table "public"."matches" from "authenticated";

revoke update on table "public"."matches" from "authenticated";

revoke delete on table "public"."matches" from "service_role";

revoke insert on table "public"."matches" from "service_role";

revoke references on table "public"."matches" from "service_role";

revoke select on table "public"."matches" from "service_role";

revoke trigger on table "public"."matches" from "service_role";

revoke truncate on table "public"."matches" from "service_role";

revoke update on table "public"."matches" from "service_role";

revoke delete on table "public"."score_predictions" from "anon";

revoke insert on table "public"."score_predictions" from "anon";

revoke references on table "public"."score_predictions" from "anon";

revoke select on table "public"."score_predictions" from "anon";

revoke trigger on table "public"."score_predictions" from "anon";

revoke truncate on table "public"."score_predictions" from "anon";

revoke update on table "public"."score_predictions" from "anon";

revoke delete on table "public"."score_predictions" from "authenticated";

revoke insert on table "public"."score_predictions" from "authenticated";

revoke references on table "public"."score_predictions" from "authenticated";

revoke select on table "public"."score_predictions" from "authenticated";

revoke trigger on table "public"."score_predictions" from "authenticated";

revoke truncate on table "public"."score_predictions" from "authenticated";

revoke update on table "public"."score_predictions" from "authenticated";

revoke delete on table "public"."score_predictions" from "service_role";

revoke insert on table "public"."score_predictions" from "service_role";

revoke references on table "public"."score_predictions" from "service_role";

revoke select on table "public"."score_predictions" from "service_role";

revoke trigger on table "public"."score_predictions" from "service_role";

revoke truncate on table "public"."score_predictions" from "service_role";

revoke update on table "public"."score_predictions" from "service_role";

revoke delete on table "public"."teams" from "anon";

revoke insert on table "public"."teams" from "anon";

revoke references on table "public"."teams" from "anon";

revoke select on table "public"."teams" from "anon";

revoke trigger on table "public"."teams" from "anon";

revoke truncate on table "public"."teams" from "anon";

revoke update on table "public"."teams" from "anon";

revoke delete on table "public"."teams" from "authenticated";

revoke insert on table "public"."teams" from "authenticated";

revoke references on table "public"."teams" from "authenticated";

revoke select on table "public"."teams" from "authenticated";

revoke trigger on table "public"."teams" from "authenticated";

revoke truncate on table "public"."teams" from "authenticated";

revoke update on table "public"."teams" from "authenticated";

revoke delete on table "public"."teams" from "service_role";

revoke insert on table "public"."teams" from "service_role";

revoke references on table "public"."teams" from "service_role";

revoke select on table "public"."teams" from "service_role";

revoke trigger on table "public"."teams" from "service_role";

revoke truncate on table "public"."teams" from "service_role";

revoke update on table "public"."teams" from "service_role";

alter table "public"."group_stage_predictions" drop constraint "group_stage_predictions_user_id_fkey";

alter table "public"."group_stage_predictions" drop constraint "group_stage_predictions_user_id_group_key";

alter table "public"."group_standings" drop constraint "group_standings_team_api_id_fkey";

alter table "public"."group_standings" drop constraint "group_standings_team_group_key";

alter table "public"."knockout_predictions" drop constraint "knockout_predictions_match_external_id_fkey";

alter table "public"."knockout_predictions" drop constraint "knockout_predictions_predicted_winner_check";

alter table "public"."knockout_predictions" drop constraint "knockout_predictions_user_id_fkey";

alter table "public"."knockout_predictions" drop constraint "knockout_predictions_user_id_match_external_id_key";

-- 1. Drop the dependent foreign key on score_predictions
alter table "public"."score_predictions" 
  drop constraint "score_predictions_match_external_id_fkey";

alter table "public"."matches" 
  drop constraint "matches_external_id_key";

alter table "public"."score_predictions" drop constraint "score_predictions_predicted_away_check";

alter table "public"."score_predictions" drop constraint "score_predictions_predicted_home_check";

alter table "public"."score_predictions" drop constraint "score_predictions_user_id_fkey";

alter table "public"."score_predictions" drop constraint "score_predictions_user_id_match_external_id_key";

alter table "public"."teams" drop constraint "teams_api_id_key";

alter table "public"."group_stage_predictions" drop constraint "group_stage_predictions_pkey";

alter table "public"."group_standings" drop constraint "group_standings_pkey";

alter table "public"."knockout_predictions" drop constraint "knockout_predictions_pkey";

alter table "public"."matches" drop constraint "matches_pkey";

alter table "public"."score_predictions" drop constraint "score_predictions_pkey";

alter table "public"."teams" drop constraint "teams_pkey";

drop index if exists "public"."group_stage_predictions_pkey";

drop index if exists "public"."group_stage_predictions_user_id_group_key";

drop index if exists "public"."group_stage_predictions_user_idx";

drop index if exists "public"."group_standings_group_name_idx";

drop index if exists "public"."group_standings_pkey";

drop index if exists "public"."group_standings_team_group_key";

drop index if exists "public"."knockout_predictions_match_idx";

drop index if exists "public"."knockout_predictions_pkey";

drop index if exists "public"."knockout_predictions_user_id_match_external_id_key";

drop index if exists "public"."knockout_predictions_user_idx";

drop index if exists "public"."matches_external_id_key";

drop index if exists "public"."matches_pkey";

drop index if exists "public"."score_predictions_match_idx";

drop index if exists "public"."score_predictions_pkey";

drop index if exists "public"."score_predictions_user_id_match_external_id_key";

drop index if exists "public"."score_predictions_user_idx";

drop index if exists "public"."teams_api_id_key";

drop index if exists "public"."teams_group_name_idx";

drop index if exists "public"."teams_pkey";

drop table "public"."group_stage_predictions";

drop table "public"."group_standings";

drop table "public"."knockout_predictions";

drop table "public"."matches";

drop table "public"."score_predictions";

drop table "public"."teams";

drop sequence if exists "public"."group_standings_id_seq";

drop sequence if exists "public"."teams_id_seq";


