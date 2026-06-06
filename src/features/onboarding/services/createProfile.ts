import { supabase } from "#/lib/supabase/supabase"
import type { ProfileInsert, ProfileData, CreateProfileDto } from "#/types/profile-data"

export async function createProfileApi({
  userId,
  displayName,
  profilePicture,
  teamId,
  email,
}: CreateProfileDto): Promise<ProfileData> {
  let avatarUrl: string | null = null

  if (profilePicture) {
    const fileExt = profilePicture.name.split(".").pop()
    const filePath = `${userId}/profile.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, profilePicture, { upsert: true })

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)
    avatarUrl = data.publicUrl
  }

  if (!avatarUrl) throw new Error("Profile picture upload failed")

  const profile: ProfileInsert = {
    id: userId,
    display_name: displayName,
    favorite_team: teamId,
    email: email,
    avatar_url: avatarUrl,
  }

  const { data: savedProfile, error: profileError } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single()

  if (profileError) throw profileError

  return savedProfile
}
