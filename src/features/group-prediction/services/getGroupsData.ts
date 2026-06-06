import { supabase } from '#/lib/supabase/supabase'
import type { GroupData, TeamInGroup } from '../types/groupPrediction'

export async function getGroupsDataApi(): Promise<GroupData[]> {
  const { data, error } = await supabase
    .from('teams')
    .select('id, name, tla, crest_url, group_name')
    .not('group_name', 'is', null)
    .order('name')

  if (error) throw error

  const groupMap = new Map<string, TeamInGroup[]>()
  for (const team of data as TeamInGroup[]) {
    const key = team.group_name
    if (!groupMap.has(key)) groupMap.set(key, [])
    groupMap.get(key)!.push(team)
  }

  return Array.from(groupMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([groupName, teams]) => ({ groupName, teams }))
}
