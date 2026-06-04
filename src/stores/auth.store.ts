import { create } from 'zustand'
import type { Session, User } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthState {
    session: Session | null
    user: User | null
    profile: Profile | null
    setSession: (session: Session | null) => void
    setProfile: (profile: Profile | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
    session: null,
    user: null,
    profile: null,
    setSession: (session) => set({ session, user: session?.user ?? null }),
    setProfile: (profile) => set({ profile }),
}))