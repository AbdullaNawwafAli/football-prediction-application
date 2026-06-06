import { supabase } from '#/lib/supabase/supabase'
import type { LeaderboardEntry } from '../types/leaderboard'

export async function getLeaderboardApi(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('user_scores')
    .select('feature1_points, total_points, profiles!inner(id, display_name, avatar_url)')
    .order('total_points', { ascending: false })

  if (error) throw error

  return data.map((row, index) => {
    const profile = row.profiles
    return {
      rank: index + 1,
      userId: profile.id,
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url,
      feature1Points: row.feature1_points,
      totalPoints: row.total_points,
    }
  })
}
