import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Appearance } from 'react-native'
import type { ThemeMode, ThemeState } from '@/shared/theme/types'
import { getStoredTheme, setStoredTheme, getSystemTheme } from '@/shared/theme/theme-storage'

interface ThemeContextValue extends ThemeState {
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getStoredTheme)
  const [systemTheme, setSystemTheme] = useState(getSystemTheme)

  const resolved = mode === 'system' ? systemTheme : mode

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    setStoredTheme(m)
  }, [])

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemTheme(colorScheme === 'dark' ? 'dark' : 'light')
    })
    return () => sub.remove()
  }, [])

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode])

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
