import { supabase } from '#/lib/supabase/supabase'
import type { Database } from '#/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

type UpdateProfileDto = {
  userId: string
  displayName: string
  profilePicture?: File
}

export async function updateProfileApi({ userId, displayName, profilePicture }: UpdateProfileDto): Promise<Profile> {
  let avatarUrl: string | undefined

  if (profilePicture) {
    const { data: existingFiles, error: listError } = await supabase.storage.from('avatars').list(userId)
    if (listError) throw listError

    if (existingFiles && existingFiles.length > 0) {
      const paths = existingFiles.map((f) => `${userId}/${f.name}`)
      const { error: removeError } = await supabase.storage.from('avatars').remove(paths)
      if (removeError) throw removeError
    }

    const fileExt = profilePicture.name.split('.').pop()
    const filePath = `${userId}/profile-${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, profilePicture)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)
    avatarUrl = data.publicUrl
  }

  const { data, error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}
