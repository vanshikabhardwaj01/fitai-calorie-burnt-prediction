import { create } from 'zustand'

interface User {
  _id: string
  email: string
  username: string
  full_name: string
  age: number
  weight_kg: number
  height_cm: number
  gender: string
  activity_level: string
  goal: string
  diet_type: string
  bmi: number
  bmi_category: string
  target_calories: number
  macros: { protein_g: number; carbs_g: number; fat_g: number }
  streak: number
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('fitai_token'),
  isAuthenticated: !!localStorage.getItem('fitai_token'),

  setAuth: (user, token) => {
    localStorage.setItem('fitai_token', token)
    set({ user, token, isAuthenticated: true })
  },

  updateUser: (updated) =>
    set((state) => ({ user: state.user ? { ...state.user, ...updated } : null })),

  logout: () => {
    localStorage.removeItem('fitai_token')
    set({ user: null, token: null, isAuthenticated: false })
  },
}))