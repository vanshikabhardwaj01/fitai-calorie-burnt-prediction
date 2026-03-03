import { create } from 'zustand'

interface ThemeState {
  theme: 'dark' | 'light'
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('fitai_theme') as 'dark' | 'light') || 'dark',
  
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('fitai_theme', newTheme)
    document.documentElement.classList.toggle('light', newTheme === 'light')
    return { theme: newTheme }
  }),
}))