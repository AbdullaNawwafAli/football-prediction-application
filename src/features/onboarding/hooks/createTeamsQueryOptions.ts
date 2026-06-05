import { queryOptions } from "@tanstack/react-query"
import { supabase } from "#/lib/supabase/supabase"
import type { Tables } from "#/types/database.types"

export type Team = Tables<"teams">

export default function createTeamsQueryOptions() {
  return queryOptions({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, crest_url, tla, group_name")
        .order("name")

      if (error) throw error
      return data as Team[]
    },
  })
}
