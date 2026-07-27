import { describe, it, expect } from 'vitest'
import { resolveConfig } from '../config/resolve-config.js'
import { buildFilePlan } from '../engine/build-file-plan.js'
import type { ScaffoldConfig } from '../types.js'

describe('buildFilePlan', () => {
  it('generates Vue default entry files', () => {
    const resolved = resolveConfig({
      name: 'test-vue',
      stack: 'vue',
      packageManager: 'pnpm',
    }, '/tmp/test-vue')
    const paths = buildFilePlan(resolved).files.map((file) => file.path)

    expect(paths).toEqual(expect.arrayContaining([
      'index.html',
      'vite.config.ts',
      'src/main.ts',
      'src/App.vue',
      'src/app/router.ts',
      'components.json',
      'uno.config.ts',
      'AGENTS.md',
    ]))
  })

  it('uses peer-compatible Vue default dependencies', () => {
    const resolved = resolveConfig({
      name: 'test-vue-dependencies',
      stack: 'vue',
      packageManager: 'pnpm',
    }, '/tmp/test-vue-dependencies')
    const dependencies = buildFilePlan(resolved).packageJson.dependencies

    expect(dependencies['@vee-validate/zod']).toBe('^4.13')
    expect(dependencies.zod).toBe('^3.24')
    expect(dependencies['vue-router']).toBe('^5.0')
    expect(dependencies.pinia).toBe('^3.0.4')
  })

  it('uses the selected VoltAgent token preset', () => {
    const resolved = resolveConfig({
      name: 'voltagent-react',
      stack: 'react',
      packageManager: 'pnpm',
      choices: { themePreset: 'voltagent' },
    }, '/tmp/voltagent-react')
    const tokens = buildFilePlan(resolved).files.find((file) => file.path === 'src/shared/styles/tokens.css')

    expect(tokens?.content).toContain('VoltAgent design preset')
  })

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
    expect(plan.packageJson.dependencies).toHaveProperty('lucide-react')
    expect(plan.packageJson.devDependencies).toHaveProperty('typescript')
    expect(plan.commands.length).toBeGreaterThan(0)

    const filePaths = plan.files.map((f) => f.path)
    expect(filePaths).toContain('src/config/env.ts')
    expect(filePaths).toEqual(expect.arrayContaining([
      'index.html',
      'vite.config.ts',
      'src/main.tsx',
      'src/App.tsx',
      'src/app/router.tsx',
      'components.json',
      'uno.config.ts',
      'AGENTS.md',
    ]))
    expect(filePaths).not.toContain('AGENT.md')

    const components = JSON.parse(plan.files.find((file) => file.path === 'components.json')?.content ?? '{}')
    expect(components).toMatchObject({
      rsc: false,
      tsx: true,
      iconLibrary: 'lucide',
      tailwind: {
        css: 'src/shared/styles/tokens.css',
        cssVariables: true,
      },
      aliases: {
        components: '@/components',
        utils: '@/shared/lib/cn',
        hooks: '@/hooks',
      },
    })
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

  it('generates React Native Expo entry files', () => {
    const resolved = resolveConfig({
      name: 'test-native',
      stack: 'react-native',
      packageManager: 'pnpm',
    }, '/tmp/test-native')
    const paths = buildFilePlan(resolved).files.map((file) => file.path)

    expect(paths).toEqual(expect.arrayContaining([
      'app.json',
      'babel.config.js',
      'metro.config.js',
      'app/_layout.tsx',
      'app/index.tsx',
      'app/+not-found.tsx',
      'AGENTS.md',
    ]))
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
    expect(plan.packageJson.dependencies).toHaveProperty('vue')
    expect(plan.commands.length).toBeGreaterThan(0)

    const filePaths = plan.files.map((f) => f.path)
    expect(filePaths).toEqual(expect.arrayContaining([
      'electron.vite.config.ts',
      'tsconfig.main.json',
      'tsconfig.preload.json',
      'src/renderer/index.html',
      'src/renderer/src/main.ts',
      'src/renderer/src/App.vue',
    ]))
    expect(filePaths.filter((path) => path === 'AGENTS.md')).toHaveLength(1)
  })

  it('Electron React renderer uses the React Vite plugin', () => {
    const resolved = resolveConfig({
      name: 'electron-react',
      stack: 'electron',
      packageManager: 'pnpm',
      choices: { rendererFramework: 'react' },
    }, '/tmp/electron-react')
    const plan = buildFilePlan(resolved)
    const configFile = plan.files.find((file) => file.path === 'electron.vite.config.ts')

    expect(configFile?.content).toContain("@vitejs/plugin-react")
    expect(configFile?.content).not.toContain("@vitejs/plugin-vue")
    expect(plan.packageJson.devDependencies).toHaveProperty('@vitejs/plugin-react')
  })

  it('node-fullstack generates a prefixed React web app', () => {
    const input: ScaffoldConfig = {
      name: 'node-web',
      stack: 'node-fullstack',
      packageManager: 'pnpm',
      choices: { webFramework: 'react' },
    }
    const resolved = resolveConfig(input, '/tmp/node-web')
    const plan = buildFilePlan(resolved)
    const filePaths = plan.files.map((f) => f.path)

    expect(filePaths).toEqual(expect.arrayContaining([
      'pnpm-workspace.yaml',
      'apps/api/package.json',
      'apps/api/src/server.ts',
      'apps/web/package.json',
      'apps/web/index.html',
      'apps/web/src/main.tsx',
      'apps/web/src/App.tsx',
    ]))
    expect(filePaths).not.toContain('src/shared/node/server.skeleton.ts')

    const apiPackage = plan.files.find((file) => file.path === 'apps/api/package.json')
    expect(apiPackage?.content).toContain('"hono"')
    expect(apiPackage?.content).toContain('"tsx"')
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
