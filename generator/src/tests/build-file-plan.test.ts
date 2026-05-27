import { describe, it, expect } from 'vitest'
import { resolveConfig } from '../config/resolve-config.js'
import { buildFilePlan } from '../engine/build-file-plan.js'
import type { ScaffoldConfig } from '../types.js'

describe('buildFilePlan', () => {
  it('generates React default file plan', () => {
    const input: ScaffoldConfig = {
      name: 'test-react',
      stack: 'react',
      packageManager: 'pnpm',
    }
    const resolved = resolveConfig(input, '/tmp/test-react')
    const plan = buildFilePlan(resolved)

    expect(plan.files.length).toBeGreaterThan(0)
    expect(plan.packageJson.dependencies).toHaveProperty('react')
    expect(plan.packageJson.devDependencies).toHaveProperty('typescript')
    expect(plan.commands.length).toBeGreaterThan(0)

    const filePaths = plan.files.map((f) => f.path)
    expect(filePaths).toContain('src/config/env.ts')
  })

  it('generates React + theme + i18n file plan', () => {
    const input: ScaffoldConfig = {
      name: 'react-full',
      stack: 'react',
      packageManager: 'pnpm',
      choices: {
        theme: 'light-dark-system',
        i18n: 'react-i18next',
        defaultLocale: 'zh-CN',
        locales: ['zh-CN', 'en-US'],
      },
    }
    const resolved = resolveConfig(input, '/tmp/react-full')
    const plan = buildFilePlan(resolved)

    const filePaths = plan.files.map((f) => f.path)

    // Theme files
    expect(filePaths).toContain('src/shared/theme/types.ts')
    expect(filePaths).toContain('src/shared/theme/theme-storage.ts')
    expect(filePaths).toContain('src/app/providers/ThemeProvider.tsx')
    expect(filePaths).toContain('src/components/patterns/ThemeToggle.tsx')

    // i18n files
    expect(filePaths).toContain('src/app/i18n.ts')
    expect(filePaths).toContain('src/app/providers/I18nProvider.tsx')
    expect(filePaths).toContain('src/locales/zh-CN.json')
    expect(filePaths).toContain('src/locales/en-US.json')

    // i18n deps
    expect(plan.packageJson.dependencies).toHaveProperty('i18next')
    expect(plan.packageJson.dependencies).toHaveProperty('react-i18next')
  })

  it('generates Vue + theme-only file plan', () => {
    const input: ScaffoldConfig = {
      name: 'vue-theme',
      stack: 'vue',
      packageManager: 'pnpm',
      choices: {
        theme: 'light-dark-system',
        i18n: 'none',
      },
    }
    const resolved = resolveConfig(input, '/tmp/vue-theme')
    const plan = buildFilePlan(resolved)

    const filePaths = plan.files.map((f) => f.path)

    expect(filePaths).toContain('src/shared/theme/types.ts')
    expect(filePaths).toContain('src/shared/theme/theme-storage.ts')
    expect(filePaths).toContain('src/shared/theme/theme-provider.ts')
    expect(filePaths).toContain('src/components/patterns/ThemeToggle.vue')

    // No i18n files
    expect(filePaths).not.toContain('src/app/i18n.ts')
    expect(filePaths).not.toContain('src/locales/zh-CN.json')
  })

  it('RN + i18n does not generate web-only theme files', () => {
    const input: ScaffoldConfig = {
      name: 'rn-i18n',
      stack: 'react-native',
      packageManager: 'pnpm',
      choices: {
        i18n: 'expo-localization+i18next',
        defaultLocale: 'zh-CN',
        locales: ['zh-CN', 'en-US'],
      },
    }
    const resolved = resolveConfig(input, '/tmp/rn-i18n')
    const plan = buildFilePlan(resolved)

    const filePaths = plan.files.map((f) => f.path)

    // RN theme files use RN-specific implementations
    const themeStorage = plan.files.find((f) => f.path === 'src/shared/theme/theme-storage.ts')
    expect(themeStorage).toBeDefined()
    expect(themeStorage?.content).toContain('Appearance')
    expect(themeStorage?.content).not.toContain('localStorage')

    // i18n present
    expect(filePaths).toContain('src/app/i18n.ts')
    const i18nFile = plan.files.find((f) => f.path === 'src/app/i18n.ts')
    expect(i18nFile?.content).toContain('expo-localization')

    // i18n deps
    expect(plan.packageJson.dependencies).toHaveProperty('expo-localization')
    expect(plan.packageJson.dependencies).toHaveProperty('i18next')
  })

  it('Electron generates nested renderer config', () => {
    const input: ScaffoldConfig = {
      name: 'electron-app',
      stack: 'electron',
      packageManager: 'pnpm',
      choices: { rendererFramework: 'vue' },
    }
    const resolved = resolveConfig(input, '/tmp/electron-app')
    const plan = buildFilePlan(resolved)

    expect(plan.packageJson.devDependencies).toHaveProperty('electron-vite')
    expect(plan.commands.length).toBeGreaterThan(0)
  })

  it('node-fullstack API-only does not generate theme/i18n files', () => {
    const input: ScaffoldConfig = {
      name: 'node-api',
      stack: 'node-fullstack',
      packageManager: 'pnpm',
      choices: { webFramework: 'none' },
    }
    const resolved = resolveConfig(input, '/tmp/node-api')
    const plan = buildFilePlan(resolved)

    const filePaths = plan.files.map((f) => f.path)

    // No theme files for API-only
    expect(filePaths).not.toContain('src/shared/theme/types.ts')
    expect(filePaths).not.toContain('src/app/providers/ThemeProvider.tsx')

    // No i18n files
    expect(filePaths).not.toContain('src/app/i18n.ts')
  })

  it('dry-run does not produce duplicate files', () => {
    const input: ScaffoldConfig = {
      name: 'dedup-test',
      stack: 'react',
      packageManager: 'pnpm',
      choices: {
        theme: 'light-dark-system',
        i18n: 'react-i18next',
      },
    }
    const resolved = resolveConfig(input, '/tmp/dedup-test')
    const plan = buildFilePlan(resolved)

    const paths = plan.files.map((f) => f.path)
    const uniquePaths = [...new Set(paths)]
    expect(paths.length).toBe(uniquePaths.length)
  })
})
