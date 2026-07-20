export type Stack = 'vue' | 'react' | 'react-native' | 'electron' | 'node-fullstack'
export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export type ThemeMode = 'light-dark-system' | 'light-only' | 'dark-only'

export interface ThemeConfig {
  mode: ThemeMode
  preset: string
}

export interface I18nConfig {
  enabled: boolean
  library: string | null
  defaultLocale: string
  locales: string[]
}

export interface ScaffoldConfig {
  name: string
  stack: Stack
  packageManager: PackageManager
  targetDir?: string
  choices?: Record<string, string | string[]>
}

export interface ResolvedConfig {
  name: string
  stack: Stack
  packageManager: PackageManager
  rootDir: string
  choices: Record<string, string | string[]>
  theme: ThemeConfig
  i18n: I18nConfig
  nested?: {
    renderer?: ResolvedConfig
    web?: ResolvedConfig
  }
}

export interface FileEntry {
  path: string
  source: 'inline' | 'snippet' | 'template'
  content: string
}

export interface CommandEntry {
  command: string
  mode: 'auto' | 'announce'
  reason: string
}

export interface FilePlan {
  files: FileEntry[]
  directories: string[]
  packageJson: {
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
    scripts: Record<string, string>
  }
  commands: CommandEntry[]
}

export interface StackOptions {
  stack: Stack
  versionBaseline: Record<string, string>
  defaults: Record<string, string>
  dimensions: Record<string, DimensionOptions>
  universalDeps: {
    deps: Record<string, string>
    devDeps: Record<string, string>
  }
  universalSnippets: SnippetMapping[]
  universalWrites: string[]
  templatePlaceholders: Record<string, string>
  postInitCli: CliEntry[]
}

export interface DimensionOptions {
  choices: Record<string, ChoiceOptions>
}

export interface ChoiceOptions {
  deps?: Record<string, string>
  devDeps?: Record<string, string>
  snippets?: string[]
  writes?: string[]
  scripts?: Record<string, string>
  commands?: CliEntry[]
  delegatesTo?: string
  rootPrefix?: string
  overrides?: Record<string, string>
}

export interface SnippetMapping {
  src: string
  dest: string
  transform?: string
  placeholders?: Record<string, string>
}

export interface CliEntry {
  command: string
  mode: 'auto' | 'announce'
  condition?: string
  reason: string
}

export interface GlobalOptions {
  dimensions: Record<string, GlobalDimension>
}

export interface GlobalDimension {
  question: string
  default: string | string[]
  choices?: Array<{
    value: string
    label: string
    description: string
    applicableStacks?: Stack[]
  }>
  dependsOn?: Record<string, string[]>
  freeText?: boolean
  multiValue?: boolean
}
