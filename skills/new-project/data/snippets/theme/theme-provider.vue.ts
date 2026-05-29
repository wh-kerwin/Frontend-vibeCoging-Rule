import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import type { ThemeMode, ThemeState } from './theme.types'
import { getStoredTheme, setStoredTheme, getSystemTheme, applyThemeToDOM } from './theme.storage.web'

const mode = ref<ThemeMode>(getStoredTheme())

const resolved = computed<'light' | 'dark'>(() =>
  mode.value === 'system' ? getSystemTheme() : mode.value,
)

export function useTheme(): ThemeState & { setMode: (m: ThemeMode) => void } {
  onMounted(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (mode.value === 'system') applyThemeToDOM(getSystemTheme())
    }
    mql.addEventListener('change', handler)
    onUnmounted(() => mql.removeEventListener('change', handler))
    applyThemeToDOM(resolved.value)
  })

  watchEffect(() => applyThemeToDOM(resolved.value))

  return {
    mode: mode.value,
    resolved: resolved.value,
    setMode(m: ThemeMode) {
      mode.value = m
      setStoredTheme(m)
    },
  }
}
