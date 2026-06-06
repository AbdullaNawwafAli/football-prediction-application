import type { ProfileData } from "#/types/profile-data";
import { supabase } from "#/lib/supabase/supabase";

export default async function getProfileApi(
    userId: string,
): Promise<ProfileData | null> {
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    return profile;
}
