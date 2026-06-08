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
      home_team:teams!matches_home_team_id_fkey(id, name, tla, crest_url),
      away_team:teams!matches_away_team_id_fkey(id, name, tla, crest_url)
    `)
    .order('utc_date', { ascending: true })

  if (error) throw error

  return data.map((row) => ({
    matchId: row.id,
    utcDate: row.utc_date,
    status: row.status ?? 'SCHEDULED',
    stage: row.stage,
    groupName: row.group_name,
    fullTimeHome: row.full_time_home,
    fullTimeAway: row.full_time_away,
    homeTeam: row.home_team
      ? { id: row.home_team.id, name: row.home_team.name, tla: row.home_team.tla, crestUrl: row.home_team.crest_url }
      : null,
    awayTeam: row.away_team
      ? { id: row.away_team.id, name: row.away_team.name, tla: row.away_team.tla, crestUrl: row.away_team.crest_url }
      : null,
  }))
}
