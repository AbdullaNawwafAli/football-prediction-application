import { supabase } from '#/lib/supabase/supabase'

export type DailyLeaderboardEntry = {
  rank: number
  userId: string
  displayName: string
  avatarUrl: string
  favoriteTeamCrestUrl: string | null
  pointsToday: number
}

export async function getDailyLeaderboardApi(date: Date): Promise<DailyLeaderboardEntry[]> {
  const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1).toISOString()

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
    .select('user_id, points_awarded, profiles(display_name, avatar_url, favorite_team)')
    .in('match_id', matchIds)
    .not('points_awarded', 'is', null)
  if (error) throw error

  const map = new Map<string, { displayName: string; avatarUrl: string; favoriteTeam: number | null; points: number }>()
  for (const row of data ?? []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
    const prev = map.get(row.user_id) ?? {
      displayName: (profile as any)?.display_name ?? '',
      avatarUrl: (profile as any)?.avatar_url ?? '',
      favoriteTeam: (profile as any)?.favorite_team ?? null,
      points: 0,
    }
    map.set(row.user_id, { ...prev, points: prev.points + (row.points_awarded ?? 0) })
  }

  const teamIds = [...new Set([...map.values()].map((v) => v.favoriteTeam).filter(Boolean))] as number[]
  const crestMap = new Map<number, string>()
  if (teamIds.length > 0) {
    const { data: teams } = await supabase
      .from('teams')
      .select('id, crest_url')
      .in('id', teamIds)
    for (const t of teams ?? []) {
      if (t.crest_url) crestMap.set(t.id, t.crest_url)
    }
  }

  return [...map.entries()]
    .sort((a, b) => {
      const diff = b[1].points - a[1].points
      return diff !== 0 ? diff : a[1].displayName.localeCompare(b[1].displayName)
    })
    .slice(0, 3)
    .map(([userId, v], i) => ({
      rank: i + 1,
      userId,
      displayName: v.displayName,
      avatarUrl: v.avatarUrl,
      favoriteTeamCrestUrl: v.favoriteTeam ? (crestMap.get(v.favoriteTeam) ?? null) : null,
      pointsToday: v.points,
    }))
}
