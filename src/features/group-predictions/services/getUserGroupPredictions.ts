import { supabase } from '#/lib/supabase/supabase'
import type { GroupPredictionsMap, GroupPick } from '../types'

export async function getUserGroupPredictions(userId: string): Promise<GroupPredictionsMap> {
  const { data, error } = await supabase
    .from('group_stage_predictions')
    .select('group_name, group_stage_prediction_picks(team_id, predicted_position, is_correct)')
    .eq('user_id', userId)

  if (error) throw error

  const map: GroupPredictionsMap = {}

  for (const row of data) {
    const picks = row.group_stage_prediction_picks
    const sorted = [...picks].sort((a, b) => a.predicted_position - b.predicted_position)
    map[row.group_name] = sorted.map((p): GroupPick => ({ teamId: p.team_id, isCorrect: p.is_correct }))
  }

  return map
}
