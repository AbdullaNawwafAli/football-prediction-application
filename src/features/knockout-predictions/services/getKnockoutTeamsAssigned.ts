import { supabase } from '#/lib/supabase/supabase'

export async function getKnockoutTeamsAssigned(): Promise<boolean> {
  const { count, error } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('stage', 'LAST_32')
    .not('home_team_id', 'is', null)

  if (error) throw error
  return (count ?? 0) > 0
}
