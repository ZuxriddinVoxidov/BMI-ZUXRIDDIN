import { create } from 'zustand'

interface AvatarStore {
  avatarUrl: string | null
  setAvatarUrl: (url: string | null) => void
}

export const useAvatarStore = create<AvatarStore>((set) => ({
  avatarUrl: null,
  setAvatarUrl: (url) => set({ avatarUrl: url }),
}))
