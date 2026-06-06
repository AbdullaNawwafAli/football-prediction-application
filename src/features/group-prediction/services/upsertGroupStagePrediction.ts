import { supabase } from '#/lib/supabase/supabase'
import type { UpsertGroupPredictionDto } from '../types/groupPrediction'

export async function upsertGroupStagePredictionApi({
  userId,
  group,
  predictedOrder,
}: UpsertGroupPredictionDto): Promise<void> {
  const { error } = await supabase
    .from('group_stage_predictions')
    .upsert(
      { user_id: userId, group, predicted_order: predictedOrder },
      { onConflict: 'user_id,group' },
    )

  if (error) throw error
}
