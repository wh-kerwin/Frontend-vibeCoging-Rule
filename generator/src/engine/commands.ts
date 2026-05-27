import type { CommandEntry, ResolvedConfig } from '../types.js'
import { loadStackOptions } from '../matrices/load-matrix.js'

export function buildCommands(config: ResolvedConfig): CommandEntry[] {
  const options = loadStackOptions(config.stack)
  const pm = config.packageManager
  const commands: CommandEntry[] = []

  for (const entry of options.postInitCli) {
    if (entry.condition && !evaluateCondition(entry.condition, config)) {
      continue
    }

    commands.push({
      command: entry.command.replaceAll('%PM%', pm),
      mode: entry.mode,
      reason: entry.reason,
    })
  }

  for (const [dimension, value] of Object.entries(config.choices)) {
    if (typeof value !== 'string') continue
    const dim = options.dimensions[dimension]
    if (!dim) continue
    const choice = dim.choices[value]
    if (!choice?.commands) continue

    for (const cmd of choice.commands) {
      commands.push({
        command: cmd.command.replaceAll('%PM%', pm),
        mode: cmd.mode,
        reason: cmd.reason,
      })
    }
  }

  return deduplicateCommands(commands)
}

function evaluateCondition(
  condition: string,
  config: ResolvedConfig,
): boolean {
  const match = condition.match(/^(\w+)\s*===\s*'([^']+)'$/)
  if (!match) return true

  const [, key, expected] = match
  const actual = config.choices[key]
  return actual === expected
}

function deduplicateCommands(commands: CommandEntry[]): CommandEntry[] {
  const seen = new Set<string>()
  return commands.filter((cmd) => {
    if (seen.has(cmd.command)) return false
    seen.add(cmd.command)
    return true
  })
}
