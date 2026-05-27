import fs from 'node:fs'
import path from 'node:path'
import type { ChoiceOptions, StackOptions } from '../types.js'

const OPTIONS_DIR = path.resolve(
  import.meta.dirname,
  '../../../workflows/options',
)

export function loadStackOptions(stack: string): StackOptions {
  const filePath = path.join(OPTIONS_DIR, `${stack}.options.json`)
  if (!fs.existsSync(filePath)) {
    throw new Error(`Stack options not found: ${filePath}`)
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as StackOptions
}

export function getChoiceOptions(
  options: StackOptions,
  dimension: string,
  choiceValue: string,
): ChoiceOptions | null {
  const dim = options.dimensions[dimension]
  if (!dim) return null
  return dim.choices[choiceValue] ?? null
}
