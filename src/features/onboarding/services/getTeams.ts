import { supabase } from "#/lib/supabase/supabase"
import type { Team } from "#/features/onboarding/types/teams"

export async function getTeamsApi(): Promise<Team[]> {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, crest_url, tla, group_name")
    .order("name")

  if (error) throw error
  return data as Team[]
}
