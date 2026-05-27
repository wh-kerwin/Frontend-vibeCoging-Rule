import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ThemeMode, ThemeState } from '@/shared/theme/types'
import { getStoredTheme, setStoredTheme, getSystemTheme, applyThemeToDOM } from '@/shared/theme/theme-storage'

interface ThemeContextValue extends ThemeState {
  setMode: (mode: ThemeMode) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(getStoredTheme)
  const resolved = mode === 'system' ? getSystemTheme() : mode

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m)
    setStoredTheme(m)
  }, [])

  useEffect(() => {
    applyThemeToDOM(resolved)
  }, [resolved])

  useEffect(() => {
    if (mode !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyThemeToDOM(getSystemTheme())
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [mode])

  const value = useMemo(() => ({ mode, resolved, setMode }), [mode, resolved, setMode])

  return <ThemeContext value={value}>{children}</ThemeContext>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
