import { describe, it, expect } from 'vitest'
import { resolveConfig } from '../config/resolve-config.js'
import type { ScaffoldConfig } from '../types.js'

describe('resolveConfig', () => {
  it('resolves React defaults correctly', () => {
    const input: ScaffoldConfig = {
      name: 'test-react',
      stack: 'react',
      packageManager: 'pnpm',
    }
    const resolved = resolveConfig(input, '/tmp/test-react')

    expect(resolved.stack).toBe('react')
    expect(resolved.choices.uiLibrary).toBe('shadcn-ui')
    expect(resolved.choices.routing).toBe('react-router')
    expect(resolved.choices.state).toBe('zustand')
    expect(resolved.choices.data).toBe('tanstack-query')
    expect(resolved.choices.buildTool).toBe('vite')
    expect(resolved.theme.mode).toBe('light-dark-system')
    expect(resolved.theme.preset).toBe('shadcn-neutral')
    expect(resolved.i18n.enabled).toBe(false)
  })

  it('resolves Vue defaults correctly', () => {
    const input: ScaffoldConfig = {
      name: 'test-vue',
      stack: 'vue',
      packageManager: 'pnpm',
    }
    const resolved = resolveConfig(input, '/tmp/test-vue')

    expect(resolved.choices.uiLibrary).toBe('shadcn-vue')
    expect(resolved.choices.routing).toBe('vue-router')
    expect(resolved.choices.state).toBe('pinia')
    expect(resolved.choices.animation).toBe('motion-v')
  })

  it('resolves React Native defaults correctly', () => {
    const input: ScaffoldConfig = {
      name: 'test-rn',
      stack: 'react-native',
      packageManager: 'pnpm',
    }
    const resolved = resolveConfig(input, '/tmp/test-rn')

    expect(resolved.choices.runtime).toBe('expo')
    expect(resolved.choices.routing).toBe('expo-router')
    expect(resolved.choices.atomicCss).toBe('nativewind')
    expect(resolved.choices.secureStorage).toBe('expo-secure-store')
  })

  it('resolves Electron with nested renderer', () => {
    const input: ScaffoldConfig = {
      name: 'test-electron',
      stack: 'electron',
      packageManager: 'pnpm',
      choices: { rendererFramework: 'vue' },
    }
    const resolved = resolveConfig(input, '/tmp/test-electron')

    expect(resolved.nested?.renderer).toBeDefined()
    expect(resolved.nested?.renderer?.stack).toBe('vue')
    expect(resolved.nested?.renderer?.choices.uiLibrary).toBe('shadcn-vue')
  })

  it('resolves node-fullstack with API-only (no web)', () => {
    const input: ScaffoldConfig = {
      name: 'test-node',
      stack: 'node-fullstack',
      packageManager: 'pnpm',
      choices: { webFramework: 'none' },
    }
    const resolved = resolveConfig(input, '/tmp/test-node')

    expect(resolved.nested?.web).toBeUndefined()
    expect(resolved.choices.apiFramework).toBe('hono')
    expect(resolved.choices.orm).toBe('drizzle')
  })

  it('resolves node-fullstack with web sub-app', () => {
    const input: ScaffoldConfig = {
      name: 'test-node-web',
      stack: 'node-fullstack',
      packageManager: 'pnpm',
      choices: { webFramework: 'react' },
    }
    const resolved = resolveConfig(input, '/tmp/test-node-web')

    expect(resolved.nested?.web).toBeDefined()
    expect(resolved.nested?.web?.stack).toBe('react')
  })

  it('enables i18n when specified', () => {
    const input: ScaffoldConfig = {
      name: 'test-i18n',
      stack: 'react',
      packageManager: 'pnpm',
      choices: {
        i18n: 'react-i18next',
        defaultLocale: 'en-US',
        locales: ['en-US', 'zh-CN'],
      },
    }
    const resolved = resolveConfig(input, '/tmp/test-i18n')

    expect(resolved.i18n.enabled).toBe(true)
    expect(resolved.i18n.library).toBe('react-i18next')
    expect(resolved.i18n.defaultLocale).toBe('en-US')
    expect(resolved.i18n.locales).toContain('en-US')
    expect(resolved.i18n.locales).toContain('zh-CN')
  })

  it('forces app-router when buildTool is next', () => {
    const input: ScaffoldConfig = {
      name: 'test-next',
      stack: 'react',
      packageManager: 'pnpm',
      choices: { buildTool: 'next' },
    }
    const resolved = resolveConfig(input, '/tmp/test-next')

    expect(resolved.choices.routing).toBe('app-router')
  })

  it('sets dark-only theme when specified', () => {
    const input: ScaffoldConfig = {
      name: 'test-dark',
      stack: 'react',
      packageManager: 'pnpm',
      choices: { theme: 'dark-only' },
    }
    const resolved = resolveConfig(input, '/tmp/test-dark')

    expect(resolved.theme.mode).toBe('dark-only')
  })
})
