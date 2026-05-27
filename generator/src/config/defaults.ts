import type { Stack, ThemeMode } from '../types.js'

export const STACK_DEFAULTS: Record<Stack, Record<string, string>> = {
  vue: {
    uiLibrary: 'shadcn-vue',
    atomicCss: 'tailwind-v4+unocss',
    routing: 'vue-router',
    state: 'pinia',
    data: 'tanstack-query',
    forms: 'vee-validate+zod',
    tests: 'vitest',
    animation: 'motion-v',
    icons: 'lucide-vue-next',
  },
  react: {
    buildTool: 'vite',
    uiLibrary: 'shadcn-ui',
    atomicCss: 'tailwind-v4+unocss',
    routing: 'react-router',
    state: 'zustand',
    data: 'tanstack-query',
    forms: 'react-hook-form+zod',
    tests: 'vitest',
    animation: 'motion',
    icons: 'lucide-react',
  },
  'react-native': {
    runtime: 'expo',
    uiLibrary: 'native-primitives',
    atomicCss: 'nativewind',
    routing: 'expo-router',
    state: 'zustand',
    data: 'tanstack-query',
    forms: 'react-hook-form+zod',
    tests: 'vitest+jest-preset',
    animation: 'react-native-reanimated',
    icons: 'lucide-react-native',
    secureStorage: 'expo-secure-store',
  },
  electron: {
    buildTool: 'electron-vite',
    storage: 'electron-store',
    tests: 'vitest',
    updates: 'electron-updater',
  },
  'node-fullstack': {
    apiFramework: 'hono',
    orm: 'drizzle',
    database: 'postgres',
    tests: 'vitest',
    contractsPackage: 'yes',
  },
}

export const GLOBAL_DEFAULTS = {
  theme: 'light-dark-system' as ThemeMode,
  themePreset: 'shadcn-neutral',
  i18n: 'none',
  defaultLocale: 'zh-CN',
  locales: ['zh-CN', 'en-US'],
  auth: 'none',
}

export const I18N_LIBRARY_MAP: Record<Stack, string | null> = {
  vue: 'vue-i18n',
  react: 'react-i18next',
  'react-native': 'expo-localization+i18next',
  electron: null,
  'node-fullstack': null,
}
