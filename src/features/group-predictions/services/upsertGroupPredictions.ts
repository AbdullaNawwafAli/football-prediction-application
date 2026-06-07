import { supabase } from '#/lib/supabase/supabase'
import type { GroupPredictionsMap } from '../types'

export async function upsertGroupPredictions(
  userId: string,
  predictions: GroupPredictionsMap,
): Promise<void> {
  for (const [groupName, teamIds] of Object.entries(predictions)) {
    const { data: predRow, error: predError } = await supabase
      .from('group_stage_predictions')
      .upsert({ user_id: userId, group_name: groupName }, { onConflict: 'user_id,group_name' })
      .select('id')
      .single()

    if (predError) throw predError

    const { error: deleteError } = await supabase
      .from('group_stage_prediction_picks')
      .delete()
      .eq('prediction_id', predRow.id)

    if (deleteError) throw deleteError

    const { error: insertError } = await supabase
      .from('group_stage_prediction_picks')
      .insert(
        teamIds.map((teamId, index) => ({
          prediction_id: predRow.id,
          team_id: teamId,
          predicted_position: index + 1,
        })),
      )

    if (insertError) throw insertError
  }
}
