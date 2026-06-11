import { supabase } from '#/lib/supabase/supabase'
import type { LeaderboardEntry } from '#/types/leaderboard'

export async function getLeaderboardApi(): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(`id, display_name, avatar_url, favorite_team,
      user_scores(feature1_points, feature2_points, total_points,
        group_stage_points, knockout_points,
        matchday1, matchday2, matchday3, last_32, last_16, qf, sf, final, third)`)

  if (error) throw error

  const teamIds = [...new Set((data ?? []).map((r) => r.favorite_team).filter(Boolean))] as number[]
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

  return (data ?? [])
    .map((row) => {
      const s = Array.isArray(row.user_scores)
        ? (row.user_scores as any[])[0]
        : (row.user_scores as any)
      return {
        rank: 0,
        userId: row.id,
        displayName: row.display_name,
        avatarUrl: row.avatar_url ?? '',
        favoriteTeamCrestUrl: row.favorite_team ? (crestMap.get(row.favorite_team) ?? null) : null,
        feature1Points: s?.feature1_points ?? 0,
        feature2Points: s?.feature2_points ?? 0,
        totalPoints: s?.total_points ?? null,
        groupStagePoints: s?.group_stage_points ?? 0,
        knockoutPoints: s?.knockout_points ?? 0,
        matchday1: s?.matchday1 ?? 0,
        matchday2: s?.matchday2 ?? 0,
        matchday3: s?.matchday3 ?? 0,
        last32:    s?.last_32   ?? 0,
        last16:    s?.last_16   ?? 0,
        qf:        s?.qf        ?? 0,
        sf:        s?.sf        ?? 0,
        final:     s?.final     ?? 0,
        third:     s?.third     ?? 0,
      }
    })
    .sort((a, b) => {
      const diff = (b.totalPoints ?? 0) - (a.totalPoints ?? 0)
      return diff !== 0 ? diff : a.displayName.localeCompare(b.displayName)
    })
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
}
