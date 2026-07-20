import path from 'node:path'
import type { FileEntry, FilePlan, ResolvedConfig } from '../types.js'
import { loadStackOptions, getChoiceOptions } from '../matrices/load-matrix.js'
import { buildPackageJson, type PackageJsonResult } from './build-package-json.js'
import { renderSnippet, snippetExists } from './render-snippet.js'
import { buildCommands } from './commands.js'
import { buildThemeFiles } from '../presets/theme.js'
import { buildI18nFiles } from '../presets/i18n.js'

export function buildFilePlan(config: ResolvedConfig): FilePlan {
  const plan = buildSingleStackPlan(config, true)

  if (config.nested?.renderer) {
    const nested = buildSingleStackPlan(config.nested.renderer, false)
    plan.files.push(...prefixFiles(nested.files, 'src/renderer'))
    plan.directories.push(...prefixDirectories(nested.directories, 'src/renderer'))
    mergePackageJson(plan.packageJson, nested.packageJson)
  }

  if (config.nested?.web) {
    const nested = buildSingleStackPlan(config.nested.web, false)
    plan.files.push(
      createPackageFile('apps/web/package.json', config.nested.web, nested.packageJson),
      ...prefixFiles(nested.files, 'apps/web'),
    )
    plan.directories.push(...prefixDirectories(nested.directories, 'apps/web'))
  }

  plan.files = deduplicateFiles(plan.files)
  plan.directories = [...new Set(plan.directories.filter(Boolean))]
  return plan
}

function buildSingleStackPlan(config: ResolvedConfig, includeProjectDocs: boolean): FilePlan {
  const options = loadStackOptions(config.stack)
  const placeholders = buildPlaceholders(config)
  const files: FileEntry[] = []
  const directories: string[] = []

  for (const snippet of options.universalSnippets) {
    if (!snippetExists(snippet.src)) continue
    if (!includeProjectDocs && snippet.src.startsWith('project-docs/')) continue

    const merged = { ...placeholders, ...(snippet.placeholders ?? {}) }
    const destination = snippet.dest === 'AGENT.md' ? 'AGENTS.md' : snippet.dest
    const source = snippet.src === 'styles/tokens.shadcn.css' && config.theme.preset === 'voltagent'
      ? 'styles/tokens.voltagent.css'
      : snippet.src
    files.push({
      path: destination,
      source: 'snippet',
      content: source === 'config/tsconfig.strict.json'
        ? buildTsconfig(config)
        : renderSnippet(source, merged),
    })
  }

  for (const [dimension, value] of Object.entries(config.choices)) {
    if (typeof value !== 'string') continue
    const choice = getChoiceOptions(options, dimension, value)
    if (!choice) continue

    for (const snippetPath of choice.snippets ?? []) {
      if (!snippetExists(snippetPath)) continue
      const source = snippetPath === 'styles/tokens.shadcn.css' && config.theme.preset === 'voltagent'
        ? 'styles/tokens.voltagent.css'
        : snippetPath
      files.push({
        path: resolveSnippetDest(source, config),
        source: 'snippet',
        content: renderSnippet(source, placeholders),
      })
    }

    collectWrites(choice.writes ?? [], config, files, directories)
  }

  collectWrites(options.universalWrites, config, files, directories)
  files.push(...buildRequiredFiles(config))

  if (isUiStack(config)) {
    files.push(...buildThemeFiles(config))
    if (config.i18n.enabled) files.push(...buildI18nFiles(config))
  }

  directories.push(...getStandardDirectories(config))

  return {
    files: deduplicateFiles(files),
    directories: [...new Set(directories.filter(Boolean))],
    packageJson: buildPackageJson(config),
    commands: buildCommands(config),
  }
}

function collectWrites(
  writes: string[],
  config: ResolvedConfig,
  files: FileEntry[],
  directories: string[],
): void {
  for (const write of writes) {
    if (write === 'package.json') continue
    if (write.endsWith('/')) {
      directories.push(write.replace(/\/$/, ''))
      continue
    }

    const filePath = write.split(':', 1)[0]
    const generated = buildDeclaredFile(filePath, config)
    if (generated) files.push(generated)
  }
}

function buildDeclaredFile(filePath: string, config: ResolvedConfig): FileEntry | null {
  const content = declaredFileContent(filePath, config)
  return content === null ? null : { path: filePath, source: 'inline', content }
}

function declaredFileContent(filePath: string, config: ResolvedConfig): string | null {
  switch (filePath) {
    case 'components.json':
      return JSON.stringify(config.stack === 'vue'
        ? {
            $schema: 'https://shadcn-vue.com/schema.json',
            style: 'new-york',
            typescript: true,
            tailwind: { config: '', css: 'src/shared/styles/tokens.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
            framework: 'vite',
            aliases: { components: '@/components', utils: '@/shared/lib/cn', ui: '@/components/ui', lib: '@/shared/lib', hooks: '@/composables' },
          }
        : {
            $schema: 'https://ui.shadcn.com/schema.json',
            style: 'new-york',
            rsc: false,
            tsx: true,
            tailwind: { config: '', css: 'src/shared/styles/tokens.css', baseColor: 'neutral', cssVariables: true, prefix: '' },
            iconLibrary: 'lucide',
            aliases: { components: '@/components', utils: '@/shared/lib/cn', ui: '@/components/ui', lib: '@/shared/lib', hooks: '@/hooks' },
          }, null, 2) + '\n'
    case 'uno.config.ts':
      return "import { defineConfig, presetIcons, presetUno } from 'unocss'\n\nexport default defineConfig({ presets: [presetUno(), presetIcons()] })\n"
    case 'src/stores/store.ts':
      return "export const store = {}\n"
    case 'packages/db/schema.ts':
      return "export {}\n"
    case 'packages/db/types.ts':
      return "export interface Database {}\n"
    case 'packages/db/client.ts':
      return "export const db = {}\n"
    case 'drizzle.config.ts':
      return "export default { schema: './packages/db/schema.ts', out: './packages/db/migrations' }\n"
    case 'packages/contracts/package.json':
      return JSON.stringify({ name: `@${config.name}/contracts`, private: true, type: 'module', exports: './index.ts' }, null, 2) + '\n'
    case 'packages/contracts/index.ts':
      return "export * from './user'\n"
    default:
      return null
  }
}

function buildRequiredFiles(config: ResolvedConfig): FileEntry[] {
  switch (config.stack) {
    case 'vue':
      return buildVueFiles(config)
    case 'react':
      return buildReactFiles(config)
    case 'react-native':
      return buildReactNativeFiles(config)
    case 'electron':
      return buildElectronFiles(config)
    case 'node-fullstack':
      return buildNodeFiles(config)
  }
}

function buildVueFiles(config: ResolvedConfig): FileEntry[] {
  const plugins = ["vue()"]
  const imports = ["import vue from '@vitejs/plugin-vue'"]
  if (String(config.choices.atomicCss).includes('tailwind')) {
    imports.push("import tailwindcss from '@tailwindcss/vite'")
    plugins.push('tailwindcss()')
  }
  if (String(config.choices.atomicCss).includes('unocss')) {
    imports.push("import UnoCSS from 'unocss/vite'")
    plugins.push('UnoCSS()')
  }

  const mainImports = ["import { createApp } from 'vue'", "import App from './App.vue'", "import './shared/styles/tokens.css'"]
  const setup: string[] = ['const app = createApp(App)']
  if (config.choices.routing === 'vue-router') {
    mainImports.push("import { router } from './app/router'")
    setup.push('app.use(router)')
  }
  if (config.choices.state === 'pinia') {
    mainImports.push("import { createPinia } from 'pinia'")
    setup.push('app.use(createPinia())')
  }
  if (config.choices.data === 'tanstack-query') {
    mainImports.push("import { VueQueryPlugin } from '@tanstack/vue-query'")
    setup.push('app.use(VueQueryPlugin)')
  }
  setup.push("app.mount('#app')")

  const files: FileEntry[] = [
    inline('index.html', '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>App</title></head><body><div id="app"></div><script type="module" src="/src/main.ts"></script></body></html>\n'),
    inline('vite.config.ts', `${imports.join('\n')}\nimport { defineConfig } from 'vite'\nimport { fileURLToPath, URL } from 'node:url'\n\nexport default defineConfig({ plugins: [${plugins.join(', ')}], resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } } })\n`),
    inline('src/main.ts', `${mainImports.join('\n')}\n\n${setup.join('\n')}\n`),
    inline('src/App.vue', config.choices.routing === 'vue-router' ? '<template><RouterView /></template>\n' : '<template><main>Ready</main></template>\n'),
    inline('src/config/env.ts', "export const env = { apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string } as const\n"),
  ]
  if (config.choices.routing === 'vue-router') {
    files.push(inline('src/app/router.ts', "import { createRouter, createWebHistory } from 'vue-router'\n\nconst HomeView = { template: '<main>Ready</main>' }\nexport const router = createRouter({ history: createWebHistory(), routes: [{ path: '/', component: HomeView }] })\n"))
  }
  return files
}

function buildReactFiles(config: ResolvedConfig): FileEntry[] {
  if (config.choices.buildTool === 'next') {
    return [
      inline('next.config.ts', "import type { NextConfig } from 'next'\n\nconst config: NextConfig = {}\nexport default config\n"),
      inline('app/layout.tsx', "import type { ReactNode } from 'react'\n\nexport default function RootLayout({ children }: { children: ReactNode }) { return <html lang=\"en\"><body>{children}</body></html> }\n"),
      inline('app/page.tsx', "export default function Page() { return <main>Ready</main> }\n"),
      inline('src/config/env.ts', "export const env = { apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL as string } as const\n"),
    ]
  }

  const plugins = ['react()']
  const imports = ["import react from '@vitejs/plugin-react'"]
  if (String(config.choices.atomicCss).includes('tailwind')) {
    imports.push("import tailwindcss from '@tailwindcss/vite'")
    plugins.push('tailwindcss()')
  }
  if (String(config.choices.atomicCss).includes('unocss')) {
    imports.push("import UnoCSS from 'unocss/vite'")
    plugins.push('UnoCSS()')
  }

  const appExpression = config.choices.routing === 'react-router' ? '<RouterProvider router={router} />' : '<App />'
  const mainImports = ["import { StrictMode } from 'react'", "import { createRoot } from 'react-dom/client'", "import './shared/styles/tokens.css'"]
  if (config.choices.routing === 'react-router') mainImports.push("import { RouterProvider } from 'react-router'", "import { router } from './app/router'")
  else mainImports.push("import App from './App'")

  return [
    inline('index.html', '<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>App</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n'),
    inline('vite.config.ts', `${imports.join('\n')}\nimport { defineConfig } from 'vite'\nimport { fileURLToPath, URL } from 'node:url'\n\nexport default defineConfig({ plugins: [${plugins.join(', ')}], resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } } })\n`),
    inline('src/main.tsx', `${mainImports.join('\n')}\n\ncreateRoot(document.getElementById('root')!).render(<StrictMode>${appExpression}</StrictMode>)\n`),
    inline('src/App.tsx', "export default function App() { return <main>Ready</main> }\n"),
    inline('src/app/router.tsx', "import { createBrowserRouter } from 'react-router'\nimport App from '@/App'\n\nexport const router = createBrowserRouter([{ path: '/', element: <App /> }])\n"),
    inline('src/config/env.ts', "export const env = { apiBaseUrl: import.meta.env.VITE_API_BASE_URL as string } as const\n"),
  ]
}

function buildReactNativeFiles(config: ResolvedConfig): FileEntry[] {
  const appJson = { expo: { name: config.name, slug: config.name, scheme: config.name, plugins: config.choices.routing === 'expo-router' ? ['expo-router'] : [] } }
  return [
    inline('app.json', JSON.stringify(appJson, null, 2) + '\n'),
    inline('babel.config.js', "export default function (api) { api.cache(true); return { presets: ['babel-preset-expo'], plugins: ['react-native-reanimated/plugin'] } }\n"),
    inline('metro.config.js', "const { getDefaultConfig } = require('expo/metro-config')\nmodule.exports = getDefaultConfig(__dirname)\n"),
    inline('app/_layout.tsx', "import { Stack } from 'expo-router'\nexport default function Layout() { return <Stack /> }\n"),
    inline('app/index.tsx', "import { Text, View } from 'react-native'\nexport default function Home() { return <View><Text>Ready</Text></View> }\n"),
    inline('app/+not-found.tsx', "import { Link } from 'expo-router'\nimport { Text, View } from 'react-native'\nexport default function NotFound() { return <View><Text>Not found</Text><Link href=\"/\">Home</Link></View> }\n"),
    inline('src/config/env.ts', "export const env = { apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL as string } as const\n"),
  ]
}

function buildElectronFiles(config: ResolvedConfig): FileEntry[] {
  const renderer = config.nested?.renderer?.stack ?? 'vue'
  const pluginImport = renderer === 'react'
    ? "import react from '@vitejs/plugin-react'"
    : "import vue from '@vitejs/plugin-vue'"
  const pluginCall = renderer === 'react' ? 'react()' : 'vue()'
  return [
    inline('electron.vite.config.ts', `import { defineConfig, externalizeDepsPlugin } from 'electron-vite'\n${pluginImport}\n\nexport default defineConfig({ main: { plugins: [externalizeDepsPlugin()] }, preload: { plugins: [externalizeDepsPlugin()] }, renderer: { root: 'src/renderer', plugins: [${pluginCall}] } })\n`),
    inline('tsconfig.main.json', JSON.stringify({ extends: './tsconfig.json', include: ['src/main/**/*'] }, null, 2) + '\n'),
    inline('tsconfig.preload.json', JSON.stringify({ extends: './tsconfig.json', include: ['src/preload/**/*'] }, null, 2) + '\n'),
  ]
}

function buildNodeFiles(config: ResolvedConfig): FileEntry[] {
  const pkg = buildPackageJson(config)
  const apiPackage = {
    name: `@${config.name}/api`,
    private: true,
    type: 'module',
    scripts: { dev: 'tsx watch src/server.ts', build: 'tsc --noEmit', typecheck: 'tsc --noEmit' },
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
  }
  return [
    inline('pnpm-workspace.yaml', "packages:\n  - 'apps/*'\n  - 'packages/*'\n"),
    inline('apps/api/package.json', JSON.stringify(apiPackage, null, 2) + '\n'),
    inline('apps/api/src/config/env.ts', "export const env = { port: Number(process.env.PORT ?? 3000), databaseUrl: process.env.DATABASE_URL ?? '' } as const\n"),
  ]
}

function buildTsconfig(config: ResolvedConfig): string {
  const isReact = config.stack === 'react' || config.stack === 'react-native'
  const isNode = config.stack === 'node-fullstack' || config.stack === 'electron'
  const isNative = config.stack === 'react-native'
  return JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'Bundler',
      lib: isNode || isNative ? ['ES2022'] : ['ES2022', 'DOM', 'DOM.Iterable'],
      strict: true,
      skipLibCheck: true,
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: isReact ? 'react-jsx' : undefined,
      baseUrl: '.',
      paths: { '@/*': ['./src/*'] },
      types: isNode ? ['node'] : isNative ? ['react', 'react-native'] : ['vite/client'],
    },
    include: config.stack === 'node-fullstack' ? ['apps/**/*', 'packages/**/*'] : ['src/**/*', 'app/**/*', '*.ts'],
  }, (_key, value) => value === undefined ? undefined : value, 2) + '\n'
}

function buildPlaceholders(config: ResolvedConfig): Record<string, string> {
  const options = loadStackOptions(config.stack)
  const tp = options.templatePlaceholders ?? {}
  const effective = config.nested?.renderer ?? config.nested?.web ?? config
  const choices = effective.choices

  return {
    '%PACKAGE_NAME%': config.name,
    '%STACK%': config.stack,
    '%UI_LIBRARY%': String(choices.uiLibrary ?? 'n/a'),
    '%ATOMIC_CSS%': String(choices.atomicCss ?? 'n/a'),
    '%ROUTING%': String(choices.routing ?? 'n/a'),
    '%STATE_LIB%': String(choices.state ?? 'n/a'),
    '%DATA_LIB%': String(choices.data ?? 'n/a'),
    '%FORMS_LIB%': String(choices.forms ?? 'n/a'),
    '%TESTS_LIB%': String(choices.tests ?? 'n/a'),
    '%ANIMATION_LIB%': String(choices.animation ?? 'n/a'),
    '%ICONS_LIB%': String(choices.icons ?? 'n/a'),
    '%PACKAGE_MANAGER%': config.packageManager,
    '%PM%': config.packageManager,
    '%VIEWS_DIR%': tp['%VIEWS_DIR%'] ?? 'views',
    '%DATA_DIR%': tp['%DATA_DIR%'] ?? 'hooks',
    '%DATA_HOOK_PATTERN%': tp['%DATA_HOOK_PATTERN%'] ?? 'use<Name>.ts',
    '%API_BASE_VAR%': tp['%API_BASE_VAR%'] ?? 'VITE_API_BASE_URL',
    '%REPO_RAW_BASE%': 'https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/',
    '%UI_INSTALL_HINT%': buildInstallHint(effective, true),
    '%UI_INSTALL_HINT_INLINE%': buildInstallHint(effective, false),
    '%THEME_MODE%': effective.theme.mode,
    '%THEME_PRESET%': effective.theme.preset,
    '%DEFAULT_LOCALE%': effective.i18n.defaultLocale,
    '%I18N_LIBRARY%': effective.i18n.library ?? 'none',
  }
}

function buildInstallHint(config: ResolvedConfig, fenced: boolean): string {
  const ui = String(config.choices.uiLibrary ?? '')
  const pm = config.packageManager
  const hints: Record<string, string> = {
    'shadcn-vue': `${pm} dlx shadcn-vue@2.7 add <component>`,
    'shadcn-ui': `${pm} dlx shadcn@2.4 add <component>`,
    'naive-ui': "import { NButton } from 'naive-ui'",
    'element-plus': "import { ElButton } from 'element-plus'",
    'ant-design-vue': "import { Button } from 'ant-design-vue'",
    'headless-only': "import { ... } from 'reka-ui'",
    mantine: "import { Button } from '@mantine/core'",
    chakra: "import { Button } from '@chakra-ui/react'",
    'radix-only': `${pm} add @radix-ui/react-<primitive>`,
    'native-primitives': "import { View, Text, Pressable } from 'react-native'",
    tamagui: "import { Button } from 'tamagui'",
    gluestack: "import { Button } from '@gluestack-ui/themed'",
  }
  const hint = hints[ui] ?? '// no renderer UI library'
  return fenced ? `\`\`\`bash\n${hint}\n\`\`\`` : hint
}

function resolveSnippetDest(snippetPath: string, config: ResolvedConfig): string {
  if (config.stack === 'node-fullstack') {
    const nodeMap: Record<string, string> = {
      'node/server.skeleton.ts': 'apps/api/src/server.ts',
      'node/feature.contract.ts': 'packages/contracts/user.ts',
      'http/errors.test.ts': 'apps/api/src/shared/http/errors.test.ts',
    }
    if (nodeMap[snippetPath]) return nodeMap[snippetPath]
  }
  const map: Record<string, string> = {
    'lib/cn.ts': 'src/shared/lib/cn.ts',
    'styles/tokens.shadcn.css': 'src/shared/styles/tokens.css',
    'styles/tokens.voltagent.css': 'src/shared/styles/tokens.css',
    'query/QueryProvider.tsx': 'src/app/providers/QueryProvider.tsx',
    'http/errors.test.ts': 'src/shared/http/errors.test.ts',
  }
  return map[snippetPath] ?? `src/shared/${snippetPath}`
}

function isUiStack(config: ResolvedConfig): boolean {
  return config.stack === 'vue' || config.stack === 'react' || config.stack === 'react-native'
}

function getStandardDirectories(config: ResolvedConfig): string[] {
  switch (config.stack) {
    case 'vue':
    case 'react':
      return ['src/app', 'src/components/ui', 'src/components/patterns', 'src/config', 'src/features', 'src/shared', 'src/stores']
    case 'react-native':
      return ['app', 'src/app', 'src/components', 'src/config', 'src/features', 'src/shared', 'src/stores']
    case 'electron':
      return ['src/main', 'src/main/services', 'src/preload']
    case 'node-fullstack':
      return ['apps/api/src', 'apps/api/src/config', 'apps/api/src/shared', 'packages']
  }
}

function prefixFiles(files: FileEntry[], prefix: string): FileEntry[] {
  return files
    .filter((file) => file.path !== 'AGENTS.md' && file.path !== 'CLAUDE.md')
    .map((file) => ({ ...file, path: path.posix.join(prefix, file.path.replaceAll('\\', '/')) }))
}

function prefixDirectories(directories: string[], prefix: string): string[] {
  return directories.map((directory) => path.posix.join(prefix, directory.replaceAll('\\', '/')))
}

function mergePackageJson(target: PackageJsonResult, source: PackageJsonResult): void {
  Object.assign(target.dependencies, source.dependencies)
  Object.assign(target.devDependencies, source.devDependencies)
  if (source.scripts.test && !target.scripts.test) target.scripts.test = source.scripts.test
}

function createPackageFile(filePath: string, config: ResolvedConfig, pkg: PackageJsonResult): FileEntry {
  return inline(filePath, JSON.stringify({
    name: `@${config.name}/web`,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: pkg.scripts,
    dependencies: pkg.dependencies,
    devDependencies: pkg.devDependencies,
  }, null, 2) + '\n')
}

function inline(filePath: string, content: string): FileEntry {
  return { path: filePath, source: 'inline', content }
}

function deduplicateFiles(files: FileEntry[]): FileEntry[] {
  const seen = new Map<string, FileEntry>()
  for (const file of files) seen.set(file.path, file)
  return [...seen.values()]
}
