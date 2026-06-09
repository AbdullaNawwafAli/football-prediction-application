import { queryOptions } from '@tanstack/react-query'
import { supabase } from '#/lib/supabase/supabase'

export function createMatchOpenQueryOptions(matchId: number) {
  return queryOptions({
    queryKey: ['match-open', matchId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('match_open', { match_ext_id: matchId })
      if (error) throw error
      return data as boolean
    },
    staleTime: 30 * 1000,
  })
}
