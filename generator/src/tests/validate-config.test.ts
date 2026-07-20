import { describe, expect, it } from 'vitest'
import { validateConfig } from '../config/validate-config.js'

describe('validateConfig stack choices', () => {
  it('rejects a UI library from another stack', () => {
    const result = validateConfig({
      name: 'invalid-vue',
      stack: 'vue',
      packageManager: 'pnpm',
      choices: { uiLibrary: 'shadcn-ui' },
    })

    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('uiLibrary')
  })

  it('rejects a dimension not supported by the selected stack', () => {
    const result = validateConfig({
      name: 'invalid-react',
      stack: 'react',
      packageManager: 'pnpm',
      choices: { orm: 'drizzle' },
    })

    expect(result.valid).toBe(false)
    expect(result.errors.join('\n')).toContain('orm')
  })

  it('accepts global choices together with stack choices', () => {
    const result = validateConfig({
      name: 'valid-react',
      stack: 'react',
      packageManager: 'pnpm',
      choices: {
        uiLibrary: 'shadcn-ui',
        theme: 'light-dark-system',
        i18n: 'react-i18next',
      },
    })

    expect(result).toEqual({ valid: true, errors: [] })
  })
})
