/**
 * Downscale and re-encode an image File on the client before upload. Avatars are
 * only ever rendered small, so shrinking the origin file reduces Storage cost,
 * upload bandwidth, and any egress that isn't served through a resized transform.
 *
 * Falls back to the original File if the input isn't a raster image or the canvas
 * pipeline is unavailable (e.g. SSR / unsupported format).
 *
 * @param file    The user-selected image File.
 * @param maxSize Longest-edge cap in px (covers retina for our largest avatar).
 * @param quality WebP encode quality (0-1).
 */
export async function resizeImage(file: File, maxSize = 256, quality = 0.8): Promise<File> {
  if (typeof document === 'undefined' || !file.type.startsWith('image/')) return file

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    return file
  }

  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    return file
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/webp', quality)
  )
  if (!blob) return file

  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([blob], name, { type: 'image/webp' })
}
