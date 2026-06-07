
  create policy "Users can delete own prediction picks"
  on "public"."group_stage_prediction_picks"
  as permissive
  for delete
  to authenticated
using ((prediction_id IN ( SELECT group_stage_predictions.id
   FROM public.group_stage_predictions
  WHERE (group_stage_predictions.user_id = auth.uid()))));



  create policy "Users can insert own prediction picks"
  on "public"."group_stage_prediction_picks"
  as permissive
  for insert
  to authenticated
with check ((prediction_id IN ( SELECT group_stage_predictions.id
   FROM public.group_stage_predictions
  WHERE (group_stage_predictions.user_id = auth.uid()))));



  create policy "Users can select own prediction picks"
  on "public"."group_stage_prediction_picks"
  as permissive
  for select
  to authenticated
using ((prediction_id IN ( SELECT group_stage_predictions.id
   FROM public.group_stage_predictions
  WHERE (group_stage_predictions.user_id = auth.uid()))));



  create policy "Users can insert own group predictions"
  on "public"."group_stage_predictions"
  as permissive
  for insert
  to authenticated
with check ((user_id = auth.uid()));



  create policy "Users can select own group predictions"
  on "public"."group_stage_predictions"
  as permissive
  for select
  to authenticated
using ((user_id = auth.uid()));



  create policy "Users can update own group predictions"
  on "public"."group_stage_predictions"
  as permissive
  for update
  to authenticated
using ((user_id = auth.uid()));



  create policy "group standings are readable by authenticated users"
  on "public"."group_standings"
  as permissive
  for select
  to authenticated
using (true);



  create policy "teams are readable by authenticated users"
  on "public"."teams"
  as permissive
  for select
  to authenticated
using (true);



