import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const skillRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const repoRoot = resolve(skillRoot, '..', '..')
const mappings = [
  ['boundaries', 'data/boundaries'],
  ['workflows/matrices', 'data/matrices'],
  ['shared/snippets', 'data/snippets'],
]

if (!existsSync(join(repoRoot, 'generator/package.json'))) {
  throw new Error(`Cannot locate repository root from ${skillRoot}`)
}

for (const [sourceRelative, bundleRelative] of mappings) {
  const source = join(repoRoot, sourceRelative)
  const destination = join(skillRoot, bundleRelative)
  rmSync(destination, { recursive: true, force: true })
  mkdirSync(dirname(destination), { recursive: true })
  cpSync(source, destination, { recursive: true })
}

console.log('Skill bundle synchronized.')
