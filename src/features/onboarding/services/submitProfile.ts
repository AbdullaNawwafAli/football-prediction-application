import { supabase } from "#/lib/supabase/supabase";
import type { Database } from "#/types/database.types";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

interface SubmitProfileParams {
  userId: string;
  displayName: string;
  profilePicture: File | undefined;
  teamId: string;
  email: string;
}

export async function submitProfile({
  userId,
  displayName,
  profilePicture,
  teamId,
  email,
}: SubmitProfileParams): Promise<void> {
  let avatarUrl: string | null = null;

  // Upload profile picture if provided
  if (profilePicture) {
    const fileExt = profilePicture.name.split(".").pop();
    const filePath = `${userId}/profile.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, profilePicture, { upsert: true });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    avatarUrl = data.publicUrl;
  }

  // Insert or update profile
  const profile: ProfileInsert = {
    id: userId,
    display_name: displayName,
    favorite_team: teamId,
    email: email,
    avatar_url: avatarUrl,
   
  };


  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" });

  if (profileError) throw profileError;
}
