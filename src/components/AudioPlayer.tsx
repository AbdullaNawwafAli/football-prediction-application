import { useEffect, useRef } from 'react'
import { useAudioStore } from '#/stores/audio.store'

export function AudioPlayer() {
  const isPlaying = useAudioStore((s) => s.isPlaying)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => {
        // Browser blocked autoplay (no user gesture on this page load, e.g. after OAuth redirect).
        // Retry on the user's next interaction so music starts without them touching the toggle.
        const retry = () => {
          audio.play().catch(() => {})
        }
        document.addEventListener('click', retry, { once: true })
        document.addEventListener('touchstart', retry, { once: true })
      })
    } else {
      audio.pause()
    }
  }, [isPlaying])

  return <audio ref={audioRef} src="/music/background.mp3" loop preload="none" />
}
