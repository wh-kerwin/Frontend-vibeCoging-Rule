import type { ResolvedConfig } from '../types.js'
import { loadStackOptions, getChoiceOptions } from '../matrices/load-matrix.js'

export interface PackageJsonResult {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
  scripts: Record<string, string>
}

export function buildPackageJson(config: ResolvedConfig): PackageJsonResult {
  const options = loadStackOptions(config.stack)

  const deps: Record<string, string> = { ...options.universalDeps.deps }
  const devDeps: Record<string, string> = { ...options.universalDeps.devDeps }
  const scripts: Record<string, string> = {
    dev: resolveDevScript(config),
    build: resolveBuildScript(config),
    typecheck: 'tsc --noEmit',
    lint: 'eslint .',
  }

  for (const [dimension, value] of Object.entries(config.choices)) {
    if (typeof value !== 'string') continue
    const choice = getChoiceOptions(options, dimension, value)
    if (!choice) continue

    mergeDeps(deps, choice.deps)
    mergeDeps(devDeps, choice.devDeps)

    if (choice.scripts) {
      Object.assign(scripts, choice.scripts)
    }
  }

  if (config.i18n.enabled) {
    mergeI18nDeps(config, deps)
  }

  if (config.theme.mode !== 'light-only') {
    mergeThemeDeps(config, deps)
  }

  return { dependencies: sortKeys(deps), devDependencies: sortKeys(devDeps), scripts }
}

function mergeDeps(
  target: Record<string, string>,
  source?: Record<string, string>,
) {
  if (!source) return
  for (const [pkg, version] of Object.entries(source)) {
    if (target[pkg] && target[pkg] !== version) {
      console.warn(
        `Dependency conflict for ${pkg}: ${target[pkg]} vs ${version}. Keeping first.`,
      )
      continue
    }
    target[pkg] = version
  }
}

function mergeI18nDeps(config: ResolvedConfig, deps: Record<string, string>) {
  switch (config.i18n.library) {
    case 'vue-i18n':
      deps['vue-i18n'] = '^10.0'
      break
    case 'react-i18next':
      deps['i18next'] = '^24.2'
      deps['react-i18next'] = '^15.4'
      deps['i18next-browser-languagedetector'] = '^8.0'
      break
    case 'expo-localization+i18next':
      deps['i18next'] = '^24.2'
      deps['react-i18next'] = '^15.4'
      deps['expo-localization'] = '^16.0'
      break
  }
}

function mergeThemeDeps(_config: ResolvedConfig, _deps: Record<string, string>) {
  // Theme doesn't add new deps beyond what the stack already provides
  // (tokens.css + Tailwind/UnoCSS handle it)
}

function resolveDevScript(config: ResolvedConfig): string {
  switch (config.stack) {
    case 'vue':
    case 'react':
      return config.choices.buildTool === 'next' ? 'next dev' : 'vite'
    case 'react-native':
      return 'expo start'
    case 'electron':
      return 'electron-vite dev'
    case 'node-fullstack':
      return 'pnpm -r dev'
  }
}

function resolveBuildScript(config: ResolvedConfig): string {
  switch (config.stack) {
    case 'vue':
    case 'react':
      return config.choices.buildTool === 'next'
        ? 'next build'
        : 'vite build'
    case 'react-native':
      return 'expo export'
    case 'electron':
      return 'electron-vite build'
    case 'node-fullstack':
      return 'pnpm -r build'
  }
}

function sortKeys(obj: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)))
}
