import { Appearance } from 'react-native'
import type { ThemeMode } from './theme.types'

let storedValue: ThemeMode = 'system'

export function getStoredTheme(): ThemeMode {
  return storedValue
}

export function setStoredTheme(mode: ThemeMode): void {
  storedValue = mode
  // In production, persist to AsyncStorage (preferences only — never secrets)
}

export function getSystemTheme(): 'light' | 'dark' {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
}
