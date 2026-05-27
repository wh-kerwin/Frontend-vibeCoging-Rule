import path from 'node:path'
import type {
  I18nConfig,
  ResolvedConfig,
  ScaffoldConfig,
  Stack,
  ThemeConfig,
  ThemeMode,
} from '../types.js'
import { GLOBAL_DEFAULTS, I18N_LIBRARY_MAP, STACK_DEFAULTS } from './defaults.js'

export function resolveConfig(
  input: ScaffoldConfig,
  targetDir?: string,
): ResolvedConfig {
  const stack = input.stack
  const userChoices = input.choices ?? {}
  const stackDefaults = STACK_DEFAULTS[stack]

  const choices: Record<string, string | string[]> = { ...stackDefaults }
  for (const [key, value] of Object.entries(userChoices)) {
    if (value !== undefined) {
      choices[key] = value
    }
  }

  if (stack === 'react' && choices.buildTool === 'next') {
    choices.routing = 'app-router'
  }

  const theme = resolveTheme(userChoices)
  const i18n = resolveI18n(stack, userChoices)

  const rootDir = targetDir
    ? path.resolve(targetDir)
    : input.targetDir
      ? path.resolve(input.targetDir)
      : path.resolve(process.cwd(), input.name)

  const resolved: ResolvedConfig = {
    name: input.name,
    stack,
    packageManager: input.packageManager,
    rootDir,
    choices,
    theme,
    i18n,
  }

  if (stack === 'electron') {
    const rendererFramework = (userChoices.rendererFramework ??
      'vue') as Stack
    resolved.nested = {
      renderer: resolveNestedConfig(
        input,
        rendererFramework,
        path.join(rootDir, 'src/renderer'),
      ),
    }
  }

  if (stack === 'node-fullstack') {
    const webFramework = (userChoices.webFramework ?? 'none') as string
    if (webFramework !== 'none') {
      resolved.nested = {
        web: resolveNestedConfig(
          input,
          webFramework as Stack,
          path.join(rootDir, 'apps/web'),
        ),
      }
    }
  }

  return resolved
}

function resolveTheme(
  userChoices: Record<string, string | string[]>,
): ThemeConfig {
  const mode = (userChoices.theme as ThemeMode) ?? GLOBAL_DEFAULTS.theme
  const preset =
    (userChoices.themePreset as string) ?? GLOBAL_DEFAULTS.themePreset

  return { mode, preset }
}

function resolveI18n(
  stack: Stack,
  userChoices: Record<string, string | string[]>,
): I18nConfig {
  const i18nChoice = (userChoices.i18n as string) ?? GLOBAL_DEFAULTS.i18n

  if (i18nChoice === 'none') {
    return {
      enabled: false,
      library: null,
      defaultLocale: GLOBAL_DEFAULTS.defaultLocale,
      locales: GLOBAL_DEFAULTS.locales,
    }
  }

  const library = i18nChoice
  const defaultLocale =
    (userChoices.defaultLocale as string) ?? GLOBAL_DEFAULTS.defaultLocale
  const locales = Array.isArray(userChoices.locales)
    ? userChoices.locales
    : GLOBAL_DEFAULTS.locales

  if (!locales.includes(defaultLocale)) {
    locales.unshift(defaultLocale)
  }

  return { enabled: true, library, defaultLocale, locales }
}

function resolveNestedConfig(
  parentInput: ScaffoldConfig,
  nestedStack: Stack,
  rootDir: string,
): ResolvedConfig {
  const nestedInput: ScaffoldConfig = {
    name: parentInput.name,
    stack: nestedStack,
    packageManager: parentInput.packageManager,
    choices: parentInput.choices,
  }

  const nestedDefaults = STACK_DEFAULTS[nestedStack]
  const userChoices = parentInput.choices ?? {}
  const choices: Record<string, string | string[]> = { ...nestedDefaults }

  for (const [key, value] of Object.entries(userChoices)) {
    if (key in nestedDefaults && value !== undefined) {
      choices[key] = value
    }
  }

  const theme = resolveTheme(userChoices)
  const i18n = resolveI18n(nestedStack, userChoices)

  return {
    name: parentInput.name,
    stack: nestedStack,
    packageManager: parentInput.packageManager,
    rootDir,
    choices,
    theme,
    i18n,
  }
}
