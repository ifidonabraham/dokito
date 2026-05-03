// ============================================
// AKILI HEALTH - Authentication State Management
// ============================================

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types'

interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  
  // Actions
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  signOut: () => void
  updateProfile: (updates: Partial<User>) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        isLoading: false,
      }),

      setLoading: (loading) => set({
        isLoading: loading,
      }),

      signOut: () => set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }),

      updateProfile: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates, updatedAt: new Date().toISOString() } : null,
      })),
    }),
    {
      name: 'akili-auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)
