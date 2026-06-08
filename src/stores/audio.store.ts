import { create } from 'zustand'

type AudioStore = {
  isPlaying: boolean
  toggle: () => void
  setPlaying: (value: boolean) => void
}

export const useAudioStore = create<AudioStore>((set) => ({
  isPlaying: false,
  toggle: () => set((s) => ({ isPlaying: !s.isPlaying })),
  setPlaying: (value) => set({ isPlaying: value }),
}))
