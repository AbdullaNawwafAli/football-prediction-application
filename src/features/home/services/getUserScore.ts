import { supabase } from '#/lib/supabase/supabase'

export type UserScore = {
  feature1Points: number
  feature2Points: number
  totalPoints: number | null
}

export async function getUserScore(userId: string): Promise<UserScore> {
  const { data, error } = await supabase
    .from('profiles')
    .select('user_scores(feature1_points, feature2_points, total_points)')
    .eq('id', userId)
    .single()

  if (error) throw error

  const s = Array.isArray(data.user_scores)
    ? (data.user_scores as any[])[0]
    : (data.user_scores as any)

  return {
    feature1Points: s?.feature1_points ?? 0,
    feature2Points: s?.feature2_points ?? 0,
    totalPoints: s?.total_points ?? null,
  }
}
