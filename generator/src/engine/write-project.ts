import fs from 'node:fs'
import path from 'node:path'
import type { FilePlan, ResolvedConfig } from '../types.js'

export function writeProject(config: ResolvedConfig, plan: FilePlan): void {
  const root = config.rootDir

  if (fs.existsSync(root)) {
    const entries = fs.readdirSync(root).filter((e) => e !== '.git')
    if (entries.length > 0) {
      throw new Error(
        `Target directory is not empty: ${root}\nFound: ${entries.slice(0, 5).join(', ')}${entries.length > 5 ? ` (+${entries.length - 5} more)` : ''}`,
      )
    }
  }

  fs.mkdirSync(root, { recursive: true })

  for (const dir of plan.directories) {
    fs.mkdirSync(path.join(root, dir), { recursive: true })
  }

  const pkgJsonContent = buildPackageJsonContent(config, plan)
  writeFile(path.join(root, 'package.json'), pkgJsonContent)

  for (const file of plan.files) {
    const filePath = path.join(root, file.path)
    writeFile(filePath, file.content)
  }
}

function writeFile(filePath: string, content: string): void {
  const dir = path.dirname(filePath)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(filePath, content, 'utf-8')
}

function buildPackageJsonContent(
  config: ResolvedConfig,
  plan: FilePlan,
): string {
  const pkg: Record<string, unknown> = {
    name: config.name,
    version: '0.1.0',
    private: true,
    type: 'module',
    scripts: plan.packageJson.scripts,
    dependencies: plan.packageJson.dependencies,
    devDependencies: plan.packageJson.devDependencies,
  }

  if (config.stack === 'electron') {
    pkg.main = 'out/main/index.js'
  }

  return JSON.stringify(pkg, null, 2) + '\n'
}

export function printDryRun(config: ResolvedConfig, plan: FilePlan): void {
  console.log('\n=== DRY RUN ===\n')
  console.log(`Project: ${config.name}`)
  console.log(`Stack:   ${config.stack}`)
  console.log(`Target:  ${config.rootDir}`)
  console.log(`Theme:   ${config.theme.mode} (${config.theme.preset})`)
  console.log(
    `I18n:    ${config.i18n.enabled ? `${config.i18n.library} [${config.i18n.locales.join(', ')}]` : 'disabled'}`,
  )

  console.log(`\nDirectories (${plan.directories.length}):`)
  for (const dir of plan.directories.sort()) {
    console.log(`  ${dir}/`)
  }

  console.log(`\nFiles (${plan.files.length}):`)
  for (const file of plan.files.sort((a, b) => a.path.localeCompare(b.path))) {
    const tag = file.source === 'snippet' ? ' (snippet)' : file.source === 'template' ? ' (template)' : ''
    console.log(`  ${file.path}${tag}`)
  }

  console.log('\npackage.json dependencies:')
  for (const [name, version] of Object.entries(plan.packageJson.dependencies)) {
    console.log(`  ${name}: ${version}`)
  }
  console.log('\npackage.json devDependencies:')
  for (const [name, version] of Object.entries(plan.packageJson.devDependencies)) {
    console.log(`  ${name}: ${version}`)
  }

  console.log(`\nCommands (${plan.commands.length}):`)
  for (const cmd of plan.commands) {
    console.log(`  [${cmd.mode}] ${cmd.command}`)
    console.log(`         ${cmd.reason}`)
  }

  console.log('\n=== END DRY RUN ===')
}
