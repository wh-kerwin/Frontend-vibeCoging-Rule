import type { FileEntry, FilePlan, ResolvedConfig } from '../types.js'
import { loadStackOptions, getChoiceOptions } from '../matrices/load-matrix.js'
import { buildPackageJson } from './build-package-json.js'
import { renderSnippet, readSnippet, snippetExists } from './render-snippet.js'
import { buildCommands } from './commands.js'
import { buildThemeFiles } from '../presets/theme.js'
import { buildI18nFiles } from '../presets/i18n.js'

export function buildFilePlan(config: ResolvedConfig): FilePlan {
  const options = loadStackOptions(config.stack)
  const files: FileEntry[] = []
  const directories: string[] = []

  const placeholders = buildPlaceholders(config)

  for (const snippet of options.universalSnippets) {
    if (snippetExists(snippet.src)) {
      const merged = { ...placeholders, ...(snippet.placeholders ?? {}) }
      const content = renderSnippet(snippet.src, merged)
      files.push({ path: snippet.dest, source: 'snippet', content })
    }
  }

  for (const [dimension, value] of Object.entries(config.choices)) {
    if (typeof value !== 'string') continue
    const choice = getChoiceOptions(options, dimension, value)
    if (!choice) continue

    if (choice.snippets) {
      for (const snippetPath of choice.snippets) {
        if (snippetExists(snippetPath)) {
          const content = renderSnippet(snippetPath, placeholders)
          const dest = resolveSnippetDest(snippetPath, config)
          files.push({ path: dest, source: 'snippet', content })
        }
      }
    }

    if (choice.writes) {
      for (const w of choice.writes) {
        if (w.endsWith('/')) {
          directories.push(w)
        }
      }
    }
  }

  files.push(...buildInlineFiles(config))

  const themeFiles = buildThemeFiles(config)
  files.push(...themeFiles)

  if (config.i18n.enabled) {
    const i18nFiles = buildI18nFiles(config)
    files.push(...i18nFiles)
  }

  for (const w of options.universalWrites) {
    if (w.endsWith('/') || w.includes('.')) continue
    if (w === 'package.json') continue
    if (!files.some((f) => f.path === w)) {
      directories.push(w.includes('/') ? w.split('/').slice(0, -1).join('/') : '')
    }
  }

  directories.push(
    ...getStandardDirectories(config),
  )

  const pkgJson = buildPackageJson(config)
  const commands = buildCommands(config)

  return {
    files: deduplicateFiles(files),
    directories: [...new Set(directories.filter(Boolean))],
    packageJson: pkgJson,
    commands,
  }
}

function buildPlaceholders(config: ResolvedConfig): Record<string, string> {
  const options = loadStackOptions(config.stack)
  const tp = options.templatePlaceholders ?? {}

  return {
    '%PACKAGE_NAME%': config.name,
    '%STACK%': config.stack,
    '%UI_LIBRARY%': String(config.choices.uiLibrary ?? 'n/a'),
    '%ATOMIC_CSS%': String(config.choices.atomicCss ?? 'n/a'),
    '%ROUTING%': String(config.choices.routing ?? 'n/a'),
    '%STATE_LIB%': String(config.choices.state ?? 'n/a'),
    '%DATA_LIB%': String(config.choices.data ?? 'n/a'),
    '%FORMS_LIB%': String(config.choices.forms ?? 'n/a'),
    '%TESTS_LIB%': String(config.choices.tests ?? 'n/a'),
    '%ANIMATION_LIB%': String(config.choices.animation ?? 'n/a'),
    '%ICONS_LIB%': String(config.choices.icons ?? 'n/a'),
    '%PACKAGE_MANAGER%': config.packageManager,
    '%PM%': config.packageManager,
    '%VIEWS_DIR%': tp['%VIEWS_DIR%'] ?? 'views',
    '%DATA_DIR%': tp['%DATA_DIR%'] ?? 'hooks',
    '%DATA_HOOK_PATTERN%': tp['%DATA_HOOK_PATTERN%'] ?? 'use<Name>.ts',
    '%API_BASE_VAR%': tp['%API_BASE_VAR%'] ?? 'VITE_API_BASE_URL',
    '%REPO_RAW_BASE%':
      'https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/',
    '%UI_INSTALL_HINT%': buildInstallHint(config, true),
    '%UI_INSTALL_HINT_INLINE%': buildInstallHint(config, false),
    '%THEME_MODE%': config.theme.mode,
    '%DEFAULT_LOCALE%': config.i18n.defaultLocale,
    '%I18N_LIBRARY%': config.i18n.library ?? 'none',
  }
}

function buildInstallHint(config: ResolvedConfig, fenced: boolean): string {
  const ui = String(config.choices.uiLibrary ?? '')
  const pm = config.packageManager
  const hintMap: Record<string, string> = {
    'shadcn-vue': `${pm} dlx shadcn-vue@latest add <component>`,
    'shadcn-ui': `${pm} dlx shadcn@latest add <component>`,
    'naive-ui': "import { NButton, NCard, ... } from 'naive-ui'",
    'element-plus': "import { ElButton, ElCard, ... } from 'element-plus'",
    'ant-design-vue': "import { Button, Card, ... } from 'ant-design-vue'",
    'headless-only': "import { ... } from 'reka-ui'",
    mantine: "import { Button, Card, ... } from '@mantine/core'",
    chakra: "import { Button, Card, ... } from '@chakra-ui/react'",
    'radix-only': `${pm} add @radix-ui/react-<primitive>`,
    'native-primitives':
      "// no install — compose with View / Text / Pressable from 'react-native'",
    tamagui: "import { Button, Card } from 'tamagui'",
    gluestack: "import { Button, Card } from '@gluestack-ui/themed'",
  }

  const hint = hintMap[ui] ?? `// ${ui}`
  return fenced ? `\`\`\`bash\n${hint}\n\`\`\`` : hint
}

function resolveSnippetDest(snippetPath: string, config: ResolvedConfig): string {
  const map: Record<string, string> = {
    'lib/cn.ts': 'src/shared/lib/cn.ts',
    'styles/tokens.shadcn.css': 'src/shared/styles/tokens.css',
    'styles/tokens.voltagent.css': 'src/shared/styles/tokens.css',
    'query/QueryProvider.tsx': 'src/app/providers/QueryProvider.tsx',
    'http/errors.test.ts': 'src/shared/http/errors.test.ts',
  }
  return map[snippetPath] ?? `src/shared/${snippetPath}`
}

function buildInlineFiles(config: ResolvedConfig): FileEntry[] {
  const files: FileEntry[] = []

  if (config.stack === 'vue') {
    files.push({
      path: 'src/config/env.ts',
      source: 'inline',
      content: `const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
} as const

export { env }
`,
    })
  }

  if (config.stack === 'react') {
    const isNext = config.choices.buildTool === 'next'
    files.push({
      path: 'src/config/env.ts',
      source: 'inline',
      content: isNext
        ? `const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL as string,
} as const

export { env }
`
        : `const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string,
} as const

export { env }
`,
    })
  }

  if (config.stack === 'react-native') {
    files.push({
      path: 'src/config/env.ts',
      source: 'inline',
      content: `const env = {
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string,
} as const

export { env }
`,
    })
  }

  return files
}

function getStandardDirectories(config: ResolvedConfig): string[] {
  const dirs = ['src/shared', 'src/features', 'src/config']

  switch (config.stack) {
    case 'vue':
      dirs.push('src/components/ui', 'src/components/patterns', 'src/app')
      if (config.choices.state !== 'none') dirs.push('src/stores')
      break
    case 'react':
      dirs.push('src/components/ui', 'src/components/patterns', 'src/app')
      if (config.choices.state !== 'none') dirs.push('src/stores')
      break
    case 'react-native':
      dirs.push('src/components', 'src/app', 'src/shared/native')
      if (config.choices.state !== 'none') dirs.push('src/stores')
      break
    case 'electron':
      dirs.push('src/main', 'src/main/services', 'src/preload')
      break
    case 'node-fullstack':
      dirs.push('apps/api/src', 'apps/api/src/shared', 'apps/api/src/config', 'packages')
      if (config.choices.contractsPackage === 'yes') {
        dirs.push('packages/contracts')
      }
      if (config.choices.orm === 'drizzle' || config.choices.orm === 'prisma' || config.choices.orm === 'kysely') {
        dirs.push('packages/db')
      }
      break
  }

  return dirs
}

function deduplicateFiles(files: FileEntry[]): FileEntry[] {
  const seen = new Map<string, FileEntry>()
  for (const file of files) {
    seen.set(file.path, file)
  }
  return [...seen.values()]
}
