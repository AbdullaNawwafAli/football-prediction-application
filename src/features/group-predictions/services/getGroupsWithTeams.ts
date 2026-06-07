import { supabase } from '#/lib/supabase/supabase'
import type { GroupOrder, TeamInGroup } from '../types'

export async function getGroupsWithTeams(): Promise<GroupOrder[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, tla, crest_url, group_name')
    .not('group_name', 'is', null)
    .order('group_name', { ascending: true })
    .order('name', { ascending: true })

  if (error) throw error

  const grouped = new Map<string, TeamInGroup[]>()

  for (const row of data) {
    const gn = row.group_name!
    if (!grouped.has(gn)) grouped.set(gn, [])
    grouped.get(gn)!.push({
      teamId: row.id,
      name: row.name,
      tla: row.tla,
      crestUrl: row.crest_url,
    })
  }

  return Array.from(grouped.entries()).map(([groupName, teams]) => ({
    groupName,
    teams,
  }))
}
