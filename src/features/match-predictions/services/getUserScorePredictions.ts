import { supabase } from '#/lib/supabase/supabase'
import type { ScorePrediction } from '../types'

export async function getUserScorePredictions(userId: string): Promise<ScorePrediction[]> {
  const { data, error } = await supabase
    .from('score_predictions')
    .select('match_id, predicted_home, predicted_away, points_awarded')
    .eq('user_id', userId)

  if (error) throw error

  return data.map((row) => ({
    matchId: row.match_id,
    predictedHome: row.predicted_home,
    predictedAway: row.predicted_away,
    pointsAwarded: row.points_awarded,
  }))
}
