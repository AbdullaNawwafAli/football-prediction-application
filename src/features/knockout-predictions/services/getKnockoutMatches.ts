import { supabase } from '#/lib/supabase/supabase'
import type { KnockoutMatchData, KnockoutTeam } from '../types'
import { KNOCKOUT_STAGES } from '../types'

export type KnockoutMatchesResult = {
  matches: KnockoutMatchData[]
  teamById: Map<number, KnockoutTeam>
}

export async function getKnockoutMatches(): Promise<KnockoutMatchesResult> {
  const { data: rows, error } = await supabase
    .from('matches')
    .select('id, stage, home_team_id, away_team_id, next_match_id, next_match_slot, next_match_loser_id, next_match_loser_slot')
    .in('stage', KNOCKOUT_STAGES as unknown as string[])
    .order('utc_date', { ascending: true })

  if (error) throw error

  const matches: KnockoutMatchData[] = rows.map((r) => ({
    matchId: r.id,
    stage: r.stage,
    dbHomeTeamId: r.home_team_id,
    dbAwayTeamId: r.away_team_id,
    nextMatchId: r.next_match_id,
    nextMatchSlot: r.next_match_slot,
    nextMatchLoserId: r.next_match_loser_id,
    nextMatchLoserSlot: r.next_match_loser_slot,
  }))

  const teamIds = new Set<number>()
  for (const r of rows) {
    if (r.home_team_id) teamIds.add(r.home_team_id)
    if (r.away_team_id) teamIds.add(r.away_team_id)
  }

  const teamById = new Map<number, KnockoutTeam>()

  if (teamIds.size > 0) {
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, name, tla, crest_url')
      .in('id', Array.from(teamIds))

    if (teamsError) throw teamsError

    for (const t of teams) {
      teamById.set(t.id, { teamId: t.id, name: t.name, tla: t.tla, crestUrl: t.crest_url })
    }
  }

  return { matches, teamById }
}
