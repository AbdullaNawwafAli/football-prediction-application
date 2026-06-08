import { supabase } from '#/lib/supabase/supabase'

export async function getFirstKnockoutMatchTime(): Promise<string | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('utc_date')
    .eq('stage', 'LAST_32')
    .order('utc_date', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data?.utc_date ?? null
}
