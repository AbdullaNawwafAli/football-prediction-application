import { supabase } from '#/lib/supabase/supabase'
import type { KnockoutPicksMap } from '../types'

export async function upsertKnockoutPredictions(
  userId: string,
  picks: KnockoutPicksMap,
): Promise<void> {
  const rows = Object.entries(picks).map(([matchId, teamId]) => ({
    user_id: userId,
    match_id: Number(matchId),
    predicted_winner_id: teamId,
  }))

  if (rows.length === 0) return

  const { error } = await supabase
    .from('knockout_predictions')
    .upsert(rows, { onConflict: 'user_id,match_id' })

  if (error) throw error
}
