import { supabase } from '#/lib/supabase/supabase'

export async function getFirstGroupMatchTime(): Promise<string | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('utc_date')
    .not('group_name', 'is', null)
    .order('utc_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data?.utc_date ?? null
}
