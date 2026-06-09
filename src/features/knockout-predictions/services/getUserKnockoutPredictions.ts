import { supabase } from '#/lib/supabase/supabase'
import type { KnockoutPicksMap, KnockoutCorrectnessMap } from '../types'

export async function getUserKnockoutPredictions(
  userId: string,
): Promise<{ picks: KnockoutPicksMap; correctness: KnockoutCorrectnessMap }> {
  const { data, error } = await supabase
    .from('knockout_predictions')
    .select('match_id, predicted_winner_id, is_correct')
    .eq('user_id', userId)

  if (error) throw error

  const picks: KnockoutPicksMap = {}
  const correctness: KnockoutCorrectnessMap = {}
  for (const row of data) {
    picks[row.match_id] = row.predicted_winner_id
    correctness[row.match_id] = row.is_correct
  }
  return { picks, correctness }
}
