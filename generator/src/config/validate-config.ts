import fs from 'node:fs'
import path from 'node:path'
import _Ajv from 'ajv'
import type { ScaffoldConfig } from '../types.js'

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

  if (valid) {
    return { valid: true, errors: [] }
  }

  const errors = (validate.errors ?? []).map((e: { instancePath?: string; message?: string }) => {
    const field = e.instancePath || '(root)'
    return `${field}: ${e.message}`
  })

  return { valid: false, errors }
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
