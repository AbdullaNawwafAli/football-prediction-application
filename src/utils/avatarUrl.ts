import { supabase } from '#/lib/supabase/supabase'

/**
 * One canonical rendered size (CSS px) for every avatar in the app. We always
 * request this single transform variant — regardless of the slot it's shown in —
 * so the same URL is reused across the header, leaderboard, hover card, etc. That
 * maximises browser/SW/CDN cache hits and minimises Storage (cached) egress.
 *
 * 96 covers our largest avatar slot (the home carousel) at 2x retina; smaller
 * slots simply downscale the same cached image. The resulting WebP is a few KB.
 */
const AVATAR_RENDER_SIZE = 96

/**
 * Convert a stored avatar public URL into a CDN image-transform URL that serves
 * the single canonical resized/compressed variant.
 *
 * @param url The stored `avatar_url` (a public object URL), or null/undefined.
 */
export function transformedAvatarUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined

  const marker = '/avatars/'
  const idx = url.indexOf(marker)
  // Not a Supabase avatars URL (e.g. local blob preview) — leave untouched.
  if (idx === -1) return url

  const path = url.slice(idx + marker.length)
  const dimension = AVATAR_RENDER_SIZE * 2

  const { data } = supabase.storage.from('avatars').getPublicUrl(path, {
    transform: { width: dimension, height: dimension, resize: 'cover', quality: 70 },
  })

  return data.publicUrl
}
