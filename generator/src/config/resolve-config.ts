import path from 'node:path'
import type {
  I18nConfig,
  ResolvedConfig,
  ScaffoldConfig,
  Stack,
  ThemeConfig,
  ThemeMode,
} from '../types.js'
import { loadGlobalOptions, loadStackOptions } from '../matrices/load-matrix.js'

export function resolveConfig(
  input: ScaffoldConfig,
  targetDir?: string,
): ResolvedConfig {
  const stack = input.stack
  const userChoices = input.choices ?? {}
  const stackDefaults = getStackDefaults(stack)

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
  const defaults = getGlobalDefaults()
  const mode = (userChoices.theme as ThemeMode) ?? defaults.theme
  const preset =
    (userChoices.themePreset as string) ?? defaults.themePreset

  return { mode, preset }
}

function resolveI18n(
  stack: Stack,
  userChoices: Record<string, string | string[]>,
): I18nConfig {
  const defaults = getGlobalDefaults()
  const i18nChoice = (userChoices.i18n as string) ?? defaults.i18n

  if (i18nChoice === 'none') {
    return {
      enabled: false,
      library: null,
      defaultLocale: defaults.defaultLocale,
      locales: [...defaults.locales],
    }
  }

  const library = i18nChoice
  const defaultLocale =
    (userChoices.defaultLocale as string) ?? defaults.defaultLocale
  const locales = Array.isArray(userChoices.locales)
    ? [...userChoices.locales]
    : [...defaults.locales]

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

  const nestedDefaults = getStackDefaults(nestedStack)
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

function getStackDefaults(stack: Stack): Record<string, string> {
  return Object.fromEntries(
    Object.entries(loadStackOptions(stack).defaults)
      .filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  )
}

function getGlobalDefaults() {
  const dimensions = loadGlobalOptions().dimensions
  return {
    theme: dimensions.theme.default as ThemeMode,
    themePreset: dimensions.themePreset.default as string,
    i18n: dimensions.i18n.default as string,
    defaultLocale: dimensions.defaultLocale.default as string,
    locales: dimensions.locales.default as string[],
  }
}
