import { supabase } from '#/lib/supabase/supabase'

export async function getKnockoutStageLockStatus(): Promise<boolean> {
  const { data, error } = await supabase.rpc('knockout_stage_open')
  if (error) throw error
  return data
}
