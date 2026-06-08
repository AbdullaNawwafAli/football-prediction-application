import { supabase } from '#/lib/supabase/supabase'
import type { KnockoutPicksMap } from '../types'

export async function getUserKnockoutPredictions(userId: string): Promise<KnockoutPicksMap> {
  const { data, error } = await supabase
    .from('knockout_predictions')
    .select('match_id, predicted_winner_id')
    .eq('user_id', userId)

  if (error) throw error

  const map: KnockoutPicksMap = {}
  for (const row of data) {
    map[row.match_id] = row.predicted_winner_id
  }
  return map
}
