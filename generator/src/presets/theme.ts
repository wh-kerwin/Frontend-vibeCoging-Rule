import type { FileEntry, ResolvedConfig } from '../types.js'
import { snippetExists, readSnippet } from '../engine/render-snippet.js'

export function buildThemeFiles(config: ResolvedConfig): FileEntry[] {
  const files: FileEntry[] = []

  if (config.stack === 'node-fullstack' && !config.nested?.web) {
    return files
  }

  const { mode } = config.theme

  if (mode === 'light-only' || mode === 'dark-only') {
    return files
  }

  switch (config.stack) {
    case 'vue':
      files.push(...buildVueThemeFiles(config))
      break
    case 'react':
      files.push(...buildReactThemeFiles(config))
      break
    case 'react-native':
      files.push(...buildRNThemeFiles(config))
      break
    case 'electron':
      // Renderer handles theme via nested config
      break
    case 'node-fullstack':
      // Web sub-app handles theme via nested config
      break
  }

  files.push({
    path: resolveThemeTypesPath(config),
    source: 'inline',
    content: THEME_TYPES,
  })

  return files
}

function resolveThemeTypesPath(config: ResolvedConfig): string {
  return 'src/shared/theme/types.ts'
}

function buildVueThemeFiles(config: ResolvedConfig): FileEntry[] {
  return [
    {
      path: 'src/shared/theme/theme-storage.ts',
      source: 'inline',
      content: WEB_THEME_STORAGE,
    },
    {
      path: 'src/shared/theme/theme-provider.ts',
      source: 'inline',
      content: VUE_THEME_PROVIDER,
    },
    {
      path: 'src/components/patterns/ThemeToggle.vue',
      source: 'inline',
      content: VUE_THEME_TOGGLE,
    },
  ]
}

function buildReactThemeFiles(config: ResolvedConfig): FileEntry[] {
  return [
    {
      path: 'src/shared/theme/theme-storage.ts',
      source: 'inline',
      content: WEB_THEME_STORAGE,
    },
    {
      path: 'src/app/providers/ThemeProvider.tsx',
      source: 'inline',
      content: REACT_THEME_PROVIDER,
    },
    {
      path: 'src/components/patterns/ThemeToggle.tsx',
      source: 'inline',
      content: REACT_THEME_TOGGLE,
    },
  ]
}

function buildRNThemeFiles(config: ResolvedConfig): FileEntry[] {
  return [
    {
      path: 'src/shared/theme/theme-storage.ts',
      source: 'inline',
      content: RN_THEME_STORAGE,
    },
    {
      path: 'src/app/providers/ThemeProvider.tsx',
      source: 'inline',
      content: RN_THEME_PROVIDER,
    },
    {
      path: 'src/components/ThemeToggle.tsx',
      source: 'inline',
      content: RN_THEME_TOGGLE,
    },
  ]
}

const THEME_TYPES = `export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeState {
  mode: ThemeMode
  resolved: 'light' | 'dark'
}
`

const WEB_THEME_STORAGE = `import type { ThemeMode } from './types'

const STORAGE_KEY = 'theme-mode'

export function getStoredTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored
  } catch {}
  return 'system'
}

export function setStoredTheme(mode: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
  } catch {}
}

export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyThemeToDOM(resolved: 'light' | 'dark'): void {
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  root.setAttribute('data-theme', resolved)
}
`

const VUE_THEME_PROVIDER = `import { ref, computed, watchEffect, onMounted, onUnmounted } from 'vue'
import type { ThemeMode, ThemeState } from './types'
import { getStoredTheme, setStoredTheme, getSystemTheme, applyThemeToDOM } from './theme-storage'

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
`

const VUE_THEME_TOGGLE = `<script setup lang="ts">
import { useTheme } from '@/shared/theme/theme-provider'
import type { ThemeMode } from '@/shared/theme/types'

const theme = useTheme()

const options: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]
</script>

<template>
  <div class="flex items-center gap-1">
    <button
      v-for="opt in options"
      :key="opt.value"
      :class="[
        'rounded-md px-2 py-1 text-sm transition-colors',
        theme.mode === opt.value
          ? 'bg-primary text-primary-foreground'
          : 'hover:bg-muted',
      ]"
      @click="theme.setMode(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
`

const REACT_THEME_PROVIDER = `import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
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
`

const REACT_THEME_TOGGLE = `import { useTheme } from '@/app/providers/ThemeProvider'
import type { ThemeMode } from '@/shared/theme/types'

const options: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <div className="flex items-center gap-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={\`rounded-md px-2 py-1 text-sm transition-colors \${
            mode === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          }\`}
          onClick={() => setMode(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
`

const RN_THEME_STORAGE = `import { Appearance } from 'react-native'
import type { ThemeMode } from './types'

const STORAGE_KEY = 'theme-mode'

let storedValue: ThemeMode = 'system'

export function getStoredTheme(): ThemeMode {
  return storedValue
}

export function setStoredTheme(mode: ThemeMode): void {
  storedValue = mode
}

export function getSystemTheme(): 'light' | 'dark' {
  return Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
}
`

const RN_THEME_PROVIDER = `import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
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
`

const RN_THEME_TOGGLE = `import { View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/app/providers/ThemeProvider'
import type { ThemeMode } from '@/shared/theme/types'

const options: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
]

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <View style={styles.container}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[styles.button, mode === opt.value && styles.active]}
          onPress={() => setMode(opt.value)}
        >
          <Text style={[styles.text, mode === opt.value && styles.activeText]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: 4 },
  button: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  active: { backgroundColor: '#171717' },
  text: { fontSize: 14, color: '#737373' },
  activeText: { color: '#fafafa' },
})
`
