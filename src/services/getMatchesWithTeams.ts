import { supabase } from '#/lib/supabase/supabase'
import type { MatchWithTeams } from '#/types/matches'

export async function getMatchesWithTeams(): Promise<MatchWithTeams[]> {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      id,
      utc_date,
      status,
      stage,
      group_name,
      full_time_home,
      full_time_away,
      half_time_home,
      half_time_away,
      home_team_id,
      away_team_id
    `)
    .order('utc_date', { ascending: true })

  if (error) throw error

  // Team name/tla/crest are identical across every match a team plays, so we
  // don't duplicate them on each match row. Fetch the distinct teams once and
  // join client-side — this is the bulk of the matches-query egress saving.
  const teamIds = [
    ...new Set(data.flatMap((r) => [r.home_team_id, r.away_team_id]).filter((id): id is number => id != null)),
  ]

  const teamMap = new Map<number, { id: number; name: string; tla: string | null; crestUrl: string | null }>()
  if (teamIds.length > 0) {
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, tla, crest_url')
      .in('id', teamIds)
    if (teamsError) throw teamsError
    for (const t of teams) {
      teamMap.set(t.id, { id: t.id, name: t.name, tla: t.tla, crestUrl: t.crest_url })
    }
  }

  const toTeam = (id: number | null) => (id != null ? (teamMap.get(id) ?? null) : null)

  return data.map((row) => ({
    matchId: row.id,
    utcDate: row.utc_date,
    status: row.status ?? 'SCHEDULED',
    stage: row.stage,
    groupName: row.group_name,
    fullTimeHome: row.full_time_home,
    fullTimeAway: row.full_time_away,
    halfTimeHome: row.half_time_home,
    halfTimeAway: row.half_time_away,
    homeTeam: toTeam(row.home_team_id),
    awayTeam: toTeam(row.away_team_id),
  }))
}
