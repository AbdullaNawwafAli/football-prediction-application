import { useEffect, useRef } from 'react'
import { useAudioStore } from '#/stores/audio.store'

export function AudioPlayer() {
  const isPlaying = useAudioStore((s) => s.isPlaying)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (isPlaying) {
      audio.play().catch(() => {})
    } else {
      audio.pause()
    }
  }, [isPlaying])

  return <audio ref={audioRef} src="/music/background.mp3" loop preload="none" />
}
