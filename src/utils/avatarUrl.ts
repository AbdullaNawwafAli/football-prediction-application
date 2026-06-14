import { supabase } from '#/lib/supabase/supabase'

/**
 * Convert a stored avatar public URL into a CDN image-transform URL that serves
 * a resized/compressed variant. Avatars are uploaded at full resolution but only
 * ever rendered small, so requesting a transformed variant drastically reduces
 * Storage (cached) egress.
 *
 * @param url   The stored `avatar_url` (a public object URL), or null/undefined.
 * @param size  Target render size in CSS px. Request 2x for retina sharpness.
 */
export function transformedAvatarUrl(
  url: string | null | undefined,
  size: number
): string | undefined {
  if (!url) return undefined

  const marker = '/avatars/'
  const idx = url.indexOf(marker)
  // Not a Supabase avatars URL (e.g. local blob preview) — leave untouched.
  if (idx === -1) return url

  const path = url.slice(idx + marker.length)
  const dimension = size * 2

  const { data } = supabase.storage.from('avatars').getPublicUrl(path, {
    transform: { width: dimension, height: dimension, resize: 'cover', quality: 70 },
  })

  return data.publicUrl
}
