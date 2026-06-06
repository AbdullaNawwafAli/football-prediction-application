import { supabase } from "#/lib/supabase/supabase";

export type UserProfile = {
  displayName: string;
  email: string;
  avatarUrl: string;
  favoriteTeam: string;
  favoriteTeamCrestUrl: string | null;
};

export async function getUserProfileApi(userId: string): Promise<UserProfile> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("display_name, email, avatar_url, favorite_team")
    .eq("id", userId)
    .single();
    
  if (error) throw error;

  const { data: team,error: teamError } = await supabase
    .from("teams")
    .select("crest_url,name")
    .eq("id", profile.favorite_team)
    .single();

  if (teamError) throw error;

  return {
    displayName: profile.display_name,
    email: profile.email,
    avatarUrl: profile.avatar_url,
    favoriteTeam: team.name,
    favoriteTeamCrestUrl: team.crest_url ,
  };
}
