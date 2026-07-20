import fs from 'node:fs'
import path from 'node:path'
import _Ajv from 'ajv'
import type { ScaffoldConfig } from '../types.js'
import { loadStackOptions } from '../matrices/load-matrix.js'

const Ajv = _Ajv as unknown as typeof _Ajv.default
const ajv = new Ajv({ allErrors: true, strict: false })

let validateFn: ReturnType<typeof ajv.compile> | null = null

function getValidator() {
  if (validateFn) return validateFn

  const schemaPath = path.resolve(
    import.meta.dirname,
    '../../../schemas/scaffold-config.schema.json',
  )
  const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
  delete schema.$schema
  validateFn = ajv.compile(schema)
  return validateFn
}

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export function validateConfig(config: unknown): ValidationResult {
  const validate = getValidator()
  const valid = validate(config)

  const errors = (validate.errors ?? []).map((e: { instancePath?: string; message?: string }) => {
    const field = e.instancePath || '(root)'
    return `${field}: ${e.message}`
  })

  if (valid) {
    errors.push(...validateStackChoices(config as ScaffoldConfig))
  }

  return { valid: errors.length === 0, errors }
}

const GLOBAL_CHOICE_KEYS = new Set([
  'theme',
  'themePreset',
  'i18n',
  'defaultLocale',
  'locales',
])

function validateStackChoices(config: ScaffoldConfig): string[] {
  const options = loadStackOptions(config.stack)
  const errors: string[] = []

  for (const [dimension, value] of Object.entries(config.choices ?? {})) {
    if (GLOBAL_CHOICE_KEYS.has(dimension)) continue

    const dimensionOptions = options.dimensions[dimension]
    if (!dimensionOptions) {
      errors.push(`/choices/${dimension}: is not supported by stack ${config.stack}`)
      continue
    }

    if (typeof value !== 'string' || !dimensionOptions.choices[value]) {
      errors.push(`/choices/${dimension}: ${String(value)} is not valid for stack ${config.stack}`)
    }
  }

  const i18n = config.choices?.i18n
  if (typeof i18n === 'string' && i18n !== 'none') {
    const effectiveStack = config.stack === 'electron'
      ? config.choices?.rendererFramework
      : config.stack === 'node-fullstack'
        ? config.choices?.webFramework
        : config.stack
    const expected = effectiveStack === 'vue'
      ? 'vue-i18n'
      : effectiveStack === 'react'
        ? 'react-i18next'
        : effectiveStack === 'react-native'
          ? 'expo-localization+i18next'
          : null
    if (i18n !== expected) {
      errors.push(`/choices/i18n: ${i18n} is not valid for stack ${config.stack}`)
    }
  }

  return errors
}

export function loadConfigFile(configPath: string): ScaffoldConfig {
  const abs = path.resolve(configPath)
  if (!fs.existsSync(abs)) {
    throw new Error(`Config file not found: ${abs}`)
  }

  const raw = JSON.parse(fs.readFileSync(abs, 'utf-8'))
  const result = validateConfig(raw)

  if (!result.valid) {
    throw new Error(
      `Invalid config file:\n${result.errors.map((e) => `  - ${e}`).join('\n')}`,
    )
  }

  return raw as ScaffoldConfig
}
