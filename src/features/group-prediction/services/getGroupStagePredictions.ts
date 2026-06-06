import { supabase } from '#/lib/supabase/supabase'
import type { PredictionState } from '../types/groupPrediction'

export async function getGroupStagePredictionsApi(
  userId: string,
): Promise<PredictionState> {
  const { data, error } = await supabase
    .from('group_stage_predictions')
    .select('group, predicted_order')
    .eq('user_id', userId)

  if (error) throw error

  return Object.fromEntries(data.map((row) => [row.group, row.predicted_order]))
}
