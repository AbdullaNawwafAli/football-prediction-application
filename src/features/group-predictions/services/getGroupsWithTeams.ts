import { supabase } from '#/lib/supabase/supabase'
import type { GroupOrder, TeamInGroup } from '../types'

export async function getGroupsWithTeams(): Promise<GroupOrder[]> {
  const { data: standings, error: standingsError } = await supabase
    .from('group_standings')
    .select('team_id, group_name')
    .order('group_name', { ascending: true })

  if (standingsError) throw standingsError
  if (!standings.length) return []

  const teamIds = standings.map((s) => s.team_id)

  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name, tla, crest_url')
    .in('id', teamIds)

  if (teamsError) throw teamsError

  const teamById = new Map(teams.map((t) => [t.id, t]))
  const grouped = new Map<string, TeamInGroup[]>()

  for (const row of standings) {
    const team = teamById.get(row.team_id)
    if (!team) continue
    if (!grouped.has(row.group_name)) grouped.set(row.group_name, [])
    grouped.get(row.group_name)!.push({
      teamId: team.id,
      name: team.name,
      tla: team.tla,
      crestUrl: team.crest_url,
    })
  }

  return Array.from(grouped.entries()).map(([groupName, groupTeams]) => ({
    groupName,
    teams: groupTeams,
  }))
}
