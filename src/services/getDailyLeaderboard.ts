import { supabase } from '#/lib/supabase/supabase'

export type DailyLeaderboardEntry = {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string
  pointsToday: number
}

export async function getDailyLeaderboardApi(date: Date): Promise<DailyLeaderboardEntry[]> {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
  const end   = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()

  const { data: matchRows, error: matchError } = await supabase
    .from('matches')
    .select('id')
    .gte('utc_date', start)
    .lt('utc_date', end)
  if (matchError) throw matchError

  const matchIds = (matchRows ?? []).map((r) => r.id)
  if (matchIds.length === 0) return []

  const { data, error } = await supabase
    .from('score_predictions')
    .select('user_id, points_awarded, profiles(display_name, avatar_url)')
    .in('match_id', matchIds)
    .not('points_awarded', 'is', null)
  if (error) throw error

  const map = new Map<string, { displayName: string; avatarUrl: string; points: number }>()
  for (const row of data ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    const prev = map.get(row.user_id) ?? {
      displayName: (profile as any)?.display_name ?? '',
      avatarUrl: (profile as any)?.avatar_url ?? '',
      points: 0,
    }
    map.set(row.user_id, { ...prev, points: prev.points + (row.points_awarded ?? 0) })
  }

  return [...map.entries()]
    .sort((a, b) => b[1].points - a[1].points)
    .slice(0, 3)
    .map(([userId, v], i) => ({
      rank: i + 1,
      userId,
      displayName: v.displayName,
      avatarUrl: v.avatarUrl,
      pointsToday: v.points,
    }))
}
