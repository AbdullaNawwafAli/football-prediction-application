import { supabase } from '#/lib/supabase/supabase'

export async function upsertScorePrediction(
  userId: string,
  matchId: number,
  predictedHome: number,
  predictedAway: number,
): Promise<void> {
  const { error } = await supabase
    .from('score_predictions')
    .upsert(
      { user_id: userId, match_id: matchId, predicted_home: predictedHome, predicted_away: predictedAway },
      { onConflict: 'user_id,match_id' },
    )

  if (error) throw error
}
