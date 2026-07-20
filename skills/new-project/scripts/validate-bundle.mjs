import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'
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

const failures = []
for (const [sourceRelative, bundleRelative] of mappings) {
  const sourceRoot = join(repoRoot, sourceRelative)
  const bundleRoot = join(skillRoot, bundleRelative)
  const sourceFiles = listFiles(sourceRoot)
  const bundleFiles = listFiles(bundleRoot)
  const allFiles = new Set([...sourceFiles, ...bundleFiles])

  for (const file of allFiles) {
    const source = join(sourceRoot, file)
    const bundled = join(bundleRoot, file)
    if (!existsSync(source) || !existsSync(bundled)) {
      failures.push(`${sourceRelative}/${file}: missing from ${existsSync(source) ? 'bundle' : 'source'}`)
      continue
    }
    if (hash(source) !== hash(bundled)) failures.push(`${sourceRelative}/${file}: content differs`)
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log('Skill bundle matches canonical boundaries, matrices, and snippets.')
}

function listFiles(root) {
  if (!existsSync(root)) return []
  const files = []
  walk(root, files)
  return files.map((file) => relative(root, file).replaceAll('\\', '/')).sort()
}

function walk(directory, files) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const fullPath = join(directory, entry.name)
    if (entry.isDirectory()) walk(fullPath, files)
    else files.push(fullPath)
  }
}

function hash(file) {
  return createHash('sha256').update(readFileSync(file)).digest('hex')
}
