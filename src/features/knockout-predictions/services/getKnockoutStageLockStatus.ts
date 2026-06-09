import { supabase } from '#/lib/supabase/supabase'

export async function getKnockoutStageLockStatus(): Promise<boolean> {
  const { count, error: countError } = await supabase
    .from('matches')
    .select('id', { count: 'exact', head: true })
    .eq('stage', 'LAST_32')
    .not('home_team_id', 'is', null)

  if (countError) throw countError
  if (!count) return false

  const { data, error } = await supabase.rpc('knockout_stage_open')
  if (error) throw error
  return data
}
