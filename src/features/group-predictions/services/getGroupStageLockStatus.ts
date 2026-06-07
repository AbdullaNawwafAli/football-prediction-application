import { supabase } from '#/lib/supabase/supabase'

export async function getGroupStageLockStatus(): Promise<boolean> {
  const { data, error } = await supabase.rpc('group_stage_open')
  if (error) throw error
  return data
}
