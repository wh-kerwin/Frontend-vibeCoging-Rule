#!/usr/bin/env node
import { Command } from 'commander'
import prompts from 'prompts'
import { loadConfigFile } from './config/validate-config.js'
import { resolveConfig } from './config/resolve-config.js'
import { buildFilePlan } from './engine/build-file-plan.js'
import { writeProject, printDryRun } from './engine/write-project.js'
import { STACK_DEFAULTS, GLOBAL_DEFAULTS } from './config/defaults.js'
import type { PackageManager, Stack } from './types.js'

const program = new Command()
  .name('scaffold')
  .description('Frontend Rules project scaffold generator')
  .version('0.1.0')

program
  .command('scaffold')
  .description('Generate a new project from config or interactive prompts')
  .option('-c, --config <path>', 'Path to scaffold.config.json')
  .option('-t, --target <dir>', 'Target directory')
  .option('-d, --dry-run', 'Print file plan without writing', false)
  .option('-s, --stack <stack>', 'Stack type (vue, react, react-native, electron, node-fullstack)')
  .action(async (opts) => {
    try {
      let scaffoldConfig

      if (opts.config) {
        scaffoldConfig = loadConfigFile(opts.config)
      } else if (opts.stack) {
        scaffoldConfig = {
          name: opts.target?.split('/').pop() ?? 'my-app',
          stack: opts.stack as Stack,
          packageManager: 'pnpm' as PackageManager,
          choices: {},
        }
      } else {
        scaffoldConfig = await interactivePrompt()
      }

      const resolved = resolveConfig(scaffoldConfig, opts.target)
      const plan = buildFilePlan(resolved)

      if (opts.dryRun) {
        printDryRun(resolved, plan)
      } else {
        writeProject(resolved, plan)
        console.log(`\nProject created at ${resolved.rootDir}`)
        console.log('\nNext steps:')
        for (const cmd of plan.commands) {
          const prefix = cmd.mode === 'auto' ? '[auto]' : '[run manually]'
          console.log(`  ${prefix} ${cmd.command}`)
        }
      }
    } catch (error) {
      console.error(error instanceof Error ? error.message : error)
      process.exit(1)
    }
  })

program.parse()

async function interactivePrompt() {
  const stackResponse = await prompts({
    type: 'select',
    name: 'stack',
    message: 'What kind of project are you creating?',
    choices: [
      { title: 'Vue 3 web app', value: 'vue' },
      { title: 'React web app', value: 'react' },
      { title: 'React Native (Expo)', value: 'react-native' },
      { title: 'Electron desktop', value: 'electron' },
      { title: 'Node full-stack monorepo', value: 'node-fullstack' },
    ],
  })

  if (!stackResponse.stack) process.exit(0)
  const stack = stackResponse.stack as Stack

  const uiChoices = getUIChoices(stack)
  const uiResponse = uiChoices.length > 0
    ? await prompts({
        type: 'select',
        name: 'uiLibrary',
        message: 'Primary UI library?',
        choices: uiChoices,
      })
    : {}

  const cssChoices = getCSSChoices(stack)
  const cssResponse = cssChoices.length > 0
    ? await prompts({
        type: 'select',
        name: 'atomicCss',
        message: 'Atomic CSS solution?',
        choices: cssChoices,
      })
    : {}

  const pmResponse = await prompts({
    type: 'select',
    name: 'packageManager',
    message: 'Package manager?',
    choices: [
      { title: 'pnpm (recommended)', value: 'pnpm' },
      { title: 'npm', value: 'npm' },
      { title: 'yarn', value: 'yarn' },
      { title: 'bun', value: 'bun' },
    ],
  })

  if (!pmResponse.packageManager) process.exit(0)

  const nameResponse = await prompts({
    type: 'text',
    name: 'name',
    message: 'Project name?',
    initial: 'my-app',
  })

  const themeResponse = await prompts({
    type: 'select',
    name: 'theme',
    message: 'Theme switching strategy?',
    choices: [
      { title: 'Light / Dark / System (recommended)', value: 'light-dark-system' },
      { title: 'Light only', value: 'light-only' },
      { title: 'Dark only', value: 'dark-only' },
    ],
  })

  const i18nChoices = getI18nChoices(stack)
  const i18nResponse = await prompts({
    type: 'select',
    name: 'i18n',
    message: 'Internationalization?',
    choices: i18nChoices,
  })

  let localeResponses: Record<string, string | string[]> = {}
  if (i18nResponse.i18n && i18nResponse.i18n !== 'none') {
    const localeRes = await prompts([
      {
        type: 'text',
        name: 'defaultLocale',
        message: 'Default locale?',
        initial: 'zh-CN',
      },
      {
        type: 'list',
        name: 'locales',
        message: 'Supported locales (comma-separated)?',
        initial: 'zh-CN, en-US',
        separator: ',',
      },
    ])
    localeResponses = localeRes
  }

  let nestedFramework: Record<string, string> = {}
  if (stack === 'electron') {
    const res = await prompts({
      type: 'select',
      name: 'rendererFramework',
      message: 'Renderer framework?',
      choices: [
        { title: 'Vue', value: 'vue' },
        { title: 'React', value: 'react' },
      ],
    })
    nestedFramework = res
  }
  if (stack === 'node-fullstack') {
    const res = await prompts({
      type: 'select',
      name: 'webFramework',
      message: 'Web sub-app framework?',
      choices: [
        { title: 'Vue', value: 'vue' },
        { title: 'React', value: 'react' },
        { title: 'None (API only)', value: 'none' },
      ],
    })
    nestedFramework = res
  }

  const customize = await prompts({
    type: 'confirm',
    name: 'value',
    message: 'Customize beyond defaults? (routing, state, data, forms, tests, animation)',
    initial: false,
  })

  let customChoices: Record<string, string> = {}
  if (customize.value) {
    customChoices = await promptCustomizations(stack)
  }

  return {
    name: nameResponse.name ?? 'my-app',
    stack,
    packageManager: pmResponse.packageManager as PackageManager,
    choices: {
      ...customChoices,
      ...(uiResponse.uiLibrary ? { uiLibrary: uiResponse.uiLibrary } : {}),
      ...(cssResponse.atomicCss ? { atomicCss: cssResponse.atomicCss } : {}),
      ...(themeResponse.theme ? { theme: themeResponse.theme } : {}),
      ...(i18nResponse.i18n ? { i18n: i18nResponse.i18n } : {}),
      ...localeResponses,
      ...nestedFramework,
    },
  }
}

function getUIChoices(stack: Stack) {
  const map: Record<string, Array<{ title: string; value: string }>> = {
    vue: [
      { title: 'shadcn-vue (recommended)', value: 'shadcn-vue' },
      { title: 'naive-ui', value: 'naive-ui' },
      { title: 'element-plus', value: 'element-plus' },
      { title: 'ant-design-vue', value: 'ant-design-vue' },
      { title: 'headless-only (Reka UI)', value: 'headless-only' },
    ],
    react: [
      { title: 'shadcn-ui (recommended)', value: 'shadcn-ui' },
      { title: 'mantine', value: 'mantine' },
      { title: 'chakra', value: 'chakra' },
      { title: 'radix-only', value: 'radix-only' },
    ],
    'react-native': [
      { title: 'native-primitives (recommended)', value: 'native-primitives' },
      { title: 'tamagui', value: 'tamagui' },
      { title: 'gluestack', value: 'gluestack' },
    ],
  }
  return map[stack] ?? []
}

function getCSSChoices(stack: Stack) {
  const map: Record<string, Array<{ title: string; value: string }>> = {
    vue: [
      { title: 'Tailwind v4 + UnoCSS (recommended)', value: 'tailwind-v4+unocss' },
      { title: 'Tailwind v4 only', value: 'tailwind-v4' },
      { title: 'UnoCSS only', value: 'unocss' },
      { title: 'None', value: 'none' },
    ],
    react: [
      { title: 'Tailwind v4 + UnoCSS (recommended)', value: 'tailwind-v4+unocss' },
      { title: 'Tailwind v4 only', value: 'tailwind-v4' },
      { title: 'UnoCSS only', value: 'unocss' },
      { title: 'None', value: 'none' },
    ],
    'react-native': [
      { title: 'NativeWind (recommended)', value: 'nativewind' },
      { title: 'None', value: 'none' },
    ],
  }
  return map[stack] ?? []
}

function getI18nChoices(stack: Stack) {
  const base = [{ title: 'No i18n (recommended)', value: 'none' }]
  const map: Record<string, Array<{ title: string; value: string }>> = {
    vue: [{ title: 'vue-i18n', value: 'vue-i18n' }],
    react: [{ title: 'react-i18next', value: 'react-i18next' }],
    'react-native': [{ title: 'expo-localization + i18next', value: 'expo-localization+i18next' }],
    electron: [],
    'node-fullstack': [],
  }
  return [...base, ...(map[stack] ?? [])]
}

async function promptCustomizations(stack: Stack): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  const dims = getCustomizableDimensions(stack)

  for (const dim of dims) {
    const response = await prompts({
      type: 'select',
      name: 'value',
      message: `${dim.label}?`,
      choices: dim.choices,
    })
    if (response.value) result[dim.key] = response.value
  }

  return result
}

function getCustomizableDimensions(stack: Stack) {
  const common = [
    {
      key: 'state',
      label: 'State management',
      choices: [
        { title: 'zustand', value: 'zustand' },
        { title: 'jotai', value: 'jotai' },
        { title: 'redux-toolkit', value: 'redux-toolkit' },
        { title: 'none', value: 'none' },
      ],
    },
    {
      key: 'data',
      label: 'Data fetching',
      choices: [
        { title: 'TanStack Query', value: 'tanstack-query' },
        { title: 'fetch-only', value: 'fetch-only' },
      ],
    },
    {
      key: 'tests',
      label: 'Testing',
      choices: [
        { title: 'vitest', value: 'vitest' },
        { title: 'none', value: 'none' },
      ],
    },
  ]

  switch (stack) {
    case 'vue':
      return [
        { key: 'routing', label: 'Routing', choices: [{ title: 'vue-router', value: 'vue-router' }, { title: 'none', value: 'none' }] },
        { key: 'state', label: 'State', choices: [{ title: 'pinia', value: 'pinia' }, { title: 'none', value: 'none' }] },
        ...common.filter((d) => d.key !== 'state'),
        { key: 'forms', label: 'Forms', choices: [{ title: 'vee-validate+zod', value: 'vee-validate+zod' }, { title: 'none', value: 'none' }] },
        { key: 'animation', label: 'Animation', choices: [{ title: 'motion-v', value: 'motion-v' }, { title: 'none', value: 'none' }] },
      ]
    case 'react':
      return [
        { key: 'buildTool', label: 'Build tool', choices: [{ title: 'Vite', value: 'vite' }, { title: 'Next.js', value: 'next' }] },
        { key: 'routing', label: 'Routing', choices: [{ title: 'react-router', value: 'react-router' }, { title: 'none', value: 'none' }] },
        ...common,
        { key: 'forms', label: 'Forms', choices: [{ title: 'react-hook-form+zod', value: 'react-hook-form+zod' }, { title: 'formik', value: 'formik' }, { title: 'none', value: 'none' }] },
        { key: 'animation', label: 'Animation', choices: [{ title: 'motion', value: 'motion' }, { title: 'none', value: 'none' }] },
      ]
    default:
      return common
  }
}
