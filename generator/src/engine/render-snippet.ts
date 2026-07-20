import fs from 'node:fs'
import path from 'node:path'

const SNIPPETS_DIR = path.resolve(
  import.meta.dirname,
  '../../../shared/snippets',
)

const ALLOWED_PLACEHOLDERS = new Set([
  '%API_BASE_VAR%',
  '%FEATURE_NAME%',
  '%FeatureName%',
  '%PACKAGE_NAME%',
  '%PACKAGE_MANAGER%',
  '%STACK%',
  '%UI_LIBRARY%',
  '%ATOMIC_CSS%',
  '%ROUTING%',
  '%STATE_LIB%',
  '%DATA_LIB%',
  '%FORMS_LIB%',
  '%TESTS_LIB%',
  '%ANIMATION_LIB%',
  '%ICONS_LIB%',
  '%VIEWS_DIR%',
  '%DATA_DIR%',
  '%DATA_HOOK_PATTERN%',
  '%REPO_RAW_BASE%',
  '%UI_INSTALL_HINT%',
  '%UI_INSTALL_HINT_INLINE%',
  '%TAILWIND_IMPORT%',
  '%TAILWIND_PLUGIN%',
  '%UNOCSS_IMPORT%',
  '%UNOCSS_PLUGIN%',
  '%PM%',
  '%THEME_MODE%',
  '%THEME_PRESET%',
  '%DEFAULT_LOCALE%',
  '%I18N_LIBRARY%',
])

const OPTIONAL_PLACEHOLDERS = new Set([
  '%FEATURE_NAME%',
  '%FeatureName%',
  '%TAILWIND_IMPORT%',
  '%TAILWIND_PLUGIN%',
  '%UNOCSS_IMPORT%',
  '%UNOCSS_PLUGIN%',
])

export function readSnippet(snippetPath: string): string {
  const fullPath = path.join(SNIPPETS_DIR, snippetPath)
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Snippet not found: ${snippetPath} (resolved to ${fullPath})`)
  }
  return fs.readFileSync(fullPath, 'utf-8')
}

export function renderSnippet(
  snippetPath: string,
  placeholders: Record<string, string>,
): string {
  let content = readSnippet(snippetPath)
  content = substitutePlaceholders(content, placeholders)
  return content
}

export function substitutePlaceholders(
  content: string,
  placeholders: Record<string, string>,
): string {
  let result = content

  for (const [key, value] of Object.entries(placeholders)) {
    if (!ALLOWED_PLACEHOLDERS.has(key)) {
      console.warn(`Unknown placeholder: ${key}`)
    }
    result = result.replaceAll(key, value)
  }

  const remaining = result.match(/%[A-Z_]+%/g)
  if (remaining) {
    const unresolved = remaining.filter(
      (m) => ALLOWED_PLACEHOLDERS.has(m) && !OPTIONAL_PLACEHOLDERS.has(m),
    )
    if (unresolved.length > 0) {
      throw new Error(
        `Unresolved placeholders in rendered snippet: ${unresolved.join(', ')}`,
      )
    }
  }

  return result
}

export function snippetExists(snippetPath: string): boolean {
  return fs.existsSync(path.join(SNIPPETS_DIR, snippetPath))
}
