import { create } from 'zustand'

type AudioStore = {
  isPlaying: boolean
  toggle: () => void
}

export const useAudioStore = create<AudioStore>((set) => ({
  isPlaying: false,
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
}))
