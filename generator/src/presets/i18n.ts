import type { FileEntry, ResolvedConfig } from '../types.js'

export function buildI18nFiles(config: ResolvedConfig): FileEntry[] {
  if (!config.i18n.enabled) return []

  const files: FileEntry[] = []

  switch (config.i18n.library) {
    case 'vue-i18n':
      files.push(...buildVueI18nFiles(config))
      break
    case 'react-i18next':
      files.push(...buildReactI18nFiles(config))
      break
    case 'expo-localization+i18next':
      files.push(...buildRNI18nFiles(config))
      break
  }

  return files
}

function buildLocaleFiles(
  config: ResolvedConfig,
  basePath: string,
): FileEntry[] {
  return config.i18n.locales.map((locale) => ({
    path: `${basePath}/${locale}.json`,
    source: 'inline' as const,
    content: generateLocaleContent(locale),
  }))
}

function generateLocaleContent(locale: string): string {
  const isZh = locale.startsWith('zh')
  const content = {
    common: {
      appName: isZh ? '我的应用' : 'My App',
      loading: isZh ? '加载中...' : 'Loading...',
      error: isZh ? '出错了' : 'Something went wrong',
      retry: isZh ? '重试' : 'Retry',
      cancel: isZh ? '取消' : 'Cancel',
      confirm: isZh ? '确认' : 'Confirm',
      save: isZh ? '保存' : 'Save',
      delete: isZh ? '删除' : 'Delete',
      edit: isZh ? '编辑' : 'Edit',
      search: isZh ? '搜索' : 'Search',
      noData: isZh ? '暂无数据' : 'No data',
    },
    nav: {
      home: isZh ? '首页' : 'Home',
      settings: isZh ? '设置' : 'Settings',
      about: isZh ? '关于' : 'About',
    },
    theme: {
      light: isZh ? '浅色' : 'Light',
      dark: isZh ? '深色' : 'Dark',
      system: isZh ? '跟随系统' : 'System',
    },
  }
  return JSON.stringify(content, null, 2) + '\n'
}

function buildVueI18nFiles(config: ResolvedConfig): FileEntry[] {
  const files: FileEntry[] = []

  files.push({
    path: 'src/app/i18n.ts',
    source: 'inline',
    content: `import { createI18n } from 'vue-i18n'
${config.i18n.locales.map((l) => `import ${localeVarName(l)} from '@/locales/${l}.json'`).join('\n')}

const i18n = createI18n({
  legacy: false,
  locale: '${config.i18n.defaultLocale}',
  fallbackLocale: '${config.i18n.defaultLocale}',
  messages: {
${config.i18n.locales.map((l) => `    '${l}': ${localeVarName(l)},`).join('\n')}
  },
})

export { i18n }
`,
  })

  files.push(...buildLocaleFiles(config, 'src/locales'))

  return files
}

function buildReactI18nFiles(config: ResolvedConfig): FileEntry[] {
  const files: FileEntry[] = []

  files.push({
    path: 'src/app/i18n.ts',
    source: 'inline',
    content: `import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
${config.i18n.locales.map((l) => `import ${localeVarName(l)} from '@/locales/${l}.json'`).join('\n')}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
${config.i18n.locales.map((l) => `      '${l}': { translation: ${localeVarName(l)} },`).join('\n')}
    },
    lng: '${config.i18n.defaultLocale}',
    fallbackLng: '${config.i18n.defaultLocale}',
    interpolation: { escapeValue: false },
  })

export { i18n }
`,
  })

  files.push({
    path: 'src/app/providers/I18nProvider.tsx',
    source: 'inline',
    content: `import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
`,
  })

  files.push(...buildLocaleFiles(config, 'src/locales'))

  return files
}

function buildRNI18nFiles(config: ResolvedConfig): FileEntry[] {
  const files: FileEntry[] = []

  files.push({
    path: 'src/app/i18n.ts',
    source: 'inline',
    content: `import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
${config.i18n.locales.map((l) => `import ${localeVarName(l)} from '@/locales/${l}.json'`).join('\n')}

const deviceLocale = getLocales()[0]?.languageTag ?? '${config.i18n.defaultLocale}'

i18n
  .use(initReactI18next)
  .init({
    resources: {
${config.i18n.locales.map((l) => `      '${l}': { translation: ${localeVarName(l)} },`).join('\n')}
    },
    lng: deviceLocale,
    fallbackLng: '${config.i18n.defaultLocale}',
    interpolation: { escapeValue: false },
  })

export { i18n }
`,
  })

  files.push({
    path: 'src/app/providers/I18nProvider.tsx',
    source: 'inline',
    content: `import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/i18n'

export function I18nProvider({ children }: { children: React.ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
`,
  })

  files.push(...buildLocaleFiles(config, 'src/locales'))

  return files
}

function localeVarName(locale: string): string {
  return locale.replace(/-/g, '_')
}
