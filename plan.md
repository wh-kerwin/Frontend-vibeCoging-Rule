# 项目脚手架生成器扩充 Plan

## 目标

在现有 `frontend-rules` 文档工作流基础上，扩充为可稳定生成项目脚手架的规则体系与本地生成器方案。生成结果需要继续遵守当前 boundaries / matrices / snippets 的约束，并新增可配置能力，重点覆盖：

- 主题切换：light / dark / system，预留多主题 token preset。
- i18n：语言包、路由/文案接入、缺失 key 检查。
- 脚手架配置项：把当前问答式选择沉淀为 schema，可被 CLI、AI workflow 和测试复用。
- 可验证生成：每个 stack 至少有 dry-run 快照测试，关键组合能安装、typecheck、build。

## 当前已有能力分析

### 已有入口

- `workflows/new-project.md` 是主工作流协议，定义 Stage 0-5，包括空目录检查、问答、矩阵解析、文件生成、CLI 执行和生成报告。
- `.claude/commands/new-project.md` 作为 Claude Code slash command 入口，指向通用 workflow。
- `README.md` 已说明 Codex / Cursor / Cline 等工具如何通过 user memory 触发 `/new-project`。

### 已有配置矩阵

当前已有 5 类 stack 矩阵：

- `workflows/matrices/vue.matrix.md`
- `workflows/matrices/react.matrix.md`
- `workflows/matrices/react-native.matrix.md`
- `workflows/matrices/electron.matrix.md`
- `workflows/matrices/node-fullstack.matrix.md`

这些矩阵已经覆盖：

- UI library
- Atomic CSS
- Routing
- State
- Data fetching
- Forms
- Tests
- Animation
- Icons
- Stack 特有项，例如 Electron updates、Node ORM/database、RN secure storage

### 已有工程边界

`boundaries/common/` 已提供跨栈约束：

- `coding-style.md`
- `design-system.md`
- `directory-rules.md`
- `encapsulation.md`
- `http-contract.md`
- `async-states.md`

各 stack 还有自己的 `ARCHITECTURE.md`。这些文档适合作为生成器的默认工程契约，不需要重写。

### 已有 snippets

`shared/snippets/` 已包含可复用代码片段：

- HTTP client / AppError / request-id middleware
- QueryProvider
- tsconfig / eslint / env
- design tokens
- project-level `AGENT.md` / `CLAUDE.md` 模板
- Electron preload / main security
- RN preferences storage
- Node server skeleton / contract sample

### 主要缺口

当前系统更像“AI 按协议生成项目”的文档规范，而不是一个可复用、可测试的脚手架引擎。缺口包括：

- 没有机器可读的配置 schema，矩阵目前主要靠 Markdown 解析和人工执行。
- 没有统一的 resolved config 数据结构，无法稳定表达 theme、i18n、auth、backend 等横向能力。
- 没有生成器 engine：文件写入、snippet 替换、package.json 合并、CLI 列表生成仍在 workflow 文本中。
- 没有模板测试和快照测试，矩阵变更后无法自动验证生成质量。
- theme / i18n 还没有成为一等配置项，当前仅有 token 文件和文档级 design-system 约束。

## 推荐架构

### 保留现有文档工作流

短期不要废弃 `workflows/new-project.md`。它仍然是 AI 工具的可读协议，也是用户理解生成过程的主文档。

新增脚手架生成器时，让 workflow 调用或模拟同一套配置 schema，而不是复制一份逻辑。

### 新增机器可读层

新增目录：

```text
schemas/
  scaffold-config.schema.json
  resolved-config.schema.json

workflows/options/
  global.options.json
  vue.options.json
  react.options.json
  react-native.options.json
  electron.options.json
  node-fullstack.options.json

generator/
  package.json
  tsconfig.json
  src/
    cli.ts
    config/
      defaults.ts
      resolve-config.ts
      validate-config.ts
    matrices/
      load-matrix.ts
      parse-markdown-matrix.ts
    engine/
      build-file-plan.ts
      build-package-json.ts
      render-snippet.ts
      write-project.ts
      commands.ts
    presets/
      theme.ts
      i18n.ts
    tests/
      fixtures/
      snapshots/
```

原则：

- Markdown 矩阵继续面向人和 AI。
- JSON options / schema 面向生成器和测试。
- 生成器输出先形成 `FilePlan`，再写磁盘，支持 `--dry-run`。
- 所有 snippets 仍从 `shared/snippets/` 读取，不在生成器里重写代码片段。

## 新增配置维度

### 全局维度

在所有 stack 的 Stage 1/2 之后新增全局配置：

| Dimension | Default | 说明 |
|---|---|---|
| `theme` | `light-dark-system` | 支持 light/dark/system 切换 |
| `theme_preset` | `shadcn-neutral` | token preset，兼容现有 shadcn / voltagent |
| `i18n` | `none` | 默认不启用，用户选择后生成语言层 |
| `default_locale` | `zh-CN` | 启用 i18n 时默认语言 |
| `locales` | `zh-CN,en-US` | 启用 i18n 时生成语言包 |
| `auth` | `none` | 先只作为占位配置，不自动生成复杂 auth |
| `env_strategy` | stack default | web 使用 Vite/Next env，RN 使用 Expo env，Node 使用 process.env |

### Theme choices

```text
theme:
  1. light-dark-system (recommended) — 支持系统偏好、手动切换、持久化。
  2. light-only — 只生成 light tokens，不生成切换器。
  3. dark-only — 只生成 dark tokens，适合后台/工具类产品。
  4. custom-token-preset — 使用指定 token preset 文件。
```

新增 snippets：

```text
shared/snippets/theme/
  theme.types.ts
  theme.storage.web.ts
  theme.storage.rn.ts
  theme-provider.react.tsx
  theme-provider.vue.ts
  theme-provider.rn.tsx
  theme-toggle.react.tsx
  theme-toggle.vue
  theme-toggle.rn.tsx
```

生成规则：

- Web：使用 `localStorage` 保存 `theme-mode`，根节点写 `data-theme` 或 `class="dark"`，与 Tailwind / CSS variables 对齐。
- RN：使用 `Appearance` + preferences storage，生成 `ThemeProvider`，不要假装 Tailwind web dark selector 能直接复用。
- Electron：renderer 走 Web 方案，main 层不关心 theme。
- Node full-stack：web 子应用启用 theme；API-only 时跳过。

### i18n choices

```text
i18n:
  1. none (recommended) — 不生成 i18n。
  2. vue-i18n — Vue 使用 vue-i18n。
  3. react-i18next — React 使用 i18next + react-i18next。
  4. expo-localization+i18next — React Native 使用 expo-localization + i18next。
```

新增 snippets：

```text
shared/snippets/i18n/
  vue/
    i18n.ts
    locales/zh-CN.json
    locales/en-US.json
  react/
    i18n.ts
    I18nProvider.tsx
    locales/zh-CN.json
    locales/en-US.json
  react-native/
    i18n.ts
    I18nProvider.tsx
    locales/zh-CN.json
    locales/en-US.json
```

生成规则：

- Vue：`src/app/i18n.ts`，`app.use(i18n)`。
- React Vite：`src/app/providers/I18nProvider.tsx`，包裹 `<App />`。
- Next：默认在 client provider 中启用，避免 server/client 边界混乱。
- RN：结合 `expo-localization` 获取默认 locale，允许用户设置覆盖值。
- Electron：renderer 走 Vue/React i18n；main/preload 不直接依赖 i18n。
- Node full-stack：web 子应用启用；API-only 只可选生成 `packages/contracts/locales`，默认不做。

## 生成器能力设计

### 输入格式

新增 `scaffold.config.json` 支持非交互生成：

```json
{
  "name": "my-app",
  "stack": "react",
  "packageManager": "pnpm",
  "choices": {
    "buildTool": "vite",
    "uiLibrary": "shadcn-ui",
    "atomicCss": "tailwind-v4+unocss",
    "routing": "react-router",
    "state": "zustand",
    "data": "tanstack-query",
    "forms": "react-hook-form+zod",
    "tests": "vitest",
    "animation": "motion",
    "theme": "light-dark-system",
    "themePreset": "shadcn-neutral",
    "i18n": "react-i18next",
    "defaultLocale": "zh-CN",
    "locales": ["zh-CN", "en-US"]
  }
}
```

### CLI

建议命令：

```bash
pnpm --dir generator dev --target ../scratch/my-app
pnpm --dir generator scaffold --config scaffold.config.json --target ../my-app
pnpm --dir generator scaffold --stack react --target ../my-app --dry-run
pnpm --dir generator test:snapshots
```

CLI 行为：

- 默认交互式，问题仍沿用 `workflows/new-project.md` 的选项。
- `--config` 跳过交互。
- `--dry-run` 输出文件计划和命令计划，不写磁盘。
- 非空目录默认失败，除非后续显式增加 `--merge`；第一阶段不要做 merge。

### ResolvedConfig

生成器内部统一解析为：

```ts
type ResolvedConfig = {
  name: string
  stack: 'vue' | 'react' | 'react-native' | 'electron' | 'node-fullstack'
  packageManager: 'pnpm' | 'npm' | 'yarn' | 'bun'
  rootDir: string
  choices: Record<string, string | string[]>
  theme: {
    mode: 'light-dark-system' | 'light-only' | 'dark-only' | 'custom-token-preset'
    preset: string
  }
  i18n: {
    enabled: boolean
    library: string | null
    defaultLocale: string
    locales: string[]
  }
  nested?: {
    renderer?: ResolvedConfig
    web?: ResolvedConfig
  }
}
```

### FilePlan

写入前先生成：

```ts
type FilePlan = {
  files: Array<{
    path: string
    source: 'inline' | 'snippet' | 'template'
    content: string
  }>
  directories: string[]
  packageJson: {
    dependencies: Record<string, string>
    devDependencies: Record<string, string>
    scripts: Record<string, string>
  }
  commands: Array<{
    command: string
    mode: 'auto' | 'announce'
    reason: string
  }>
}
```

这样能测试“应该生成什么”，不必真的写磁盘或安装依赖。

## 实施任务

### Task 1：补齐配置 schema

**Files:**

- Create: `schemas/scaffold-config.schema.json`
- Create: `schemas/resolved-config.schema.json`
- Create: `workflows/options/global.options.json`

**步骤:**

1. 写 `scaffold-config.schema.json`，覆盖 name、stack、packageManager、choices、targetDir。
2. 写 `resolved-config.schema.json`，覆盖解析后的 nested renderer/web、theme、i18n。
3. 写 `global.options.json`，加入 theme、theme_preset、i18n、default_locale、locales。
4. 更新 `README.md`，说明 Markdown workflow 与 JSON schema 的关系。

**验收:**

- schema 能表达当前 5 个 stack 的已有选择。
- theme / i18n 不需要进入每个 stack 文档重复描述。

### Task 2：把矩阵选项拆出机器可读 options

**Files:**

- Create: `workflows/options/vue.options.json`
- Create: `workflows/options/react.options.json`
- Create: `workflows/options/react-native.options.json`
- Create: `workflows/options/electron.options.json`
- Create: `workflows/options/node-fullstack.options.json`
- Modify: `workflows/matrices/*.matrix.md`

**步骤:**

1. 从每个 Markdown matrix 的 Defaults / Choices 提取为 JSON。
2. Markdown 保留人类说明，但增加“machine-readable source”指向 options 文件。
3. 保证 options 中有 dependencies、devDependencies、writes、snippets、commands。
4. Electron / node-fullstack 的 nested web/renderer 用引用表达，不复制 Vue/React 选项。

**验收:**

- 每个 JSON options 能独立解析默认选择。
- Markdown 与 JSON 的默认值一致。

### Task 3：实现生成器基础工程

**Files:**

- Create: `generator/package.json`
- Create: `generator/tsconfig.json`
- Create: `generator/src/cli.ts`
- Create: `generator/src/config/validate-config.ts`
- Create: `generator/src/config/resolve-config.ts`
- Create: `generator/src/engine/build-file-plan.ts`
- Create: `generator/src/engine/write-project.ts`

**步骤:**

1. 使用 TypeScript + Node 22。
2. CLI 支持 `--config`、`--target`、`--dry-run`。
3. `validate-config.ts` 用 schema 校验输入。
4. `resolve-config.ts` 合并 defaults、用户 choices、global options。
5. `build-file-plan.ts` 只生成计划，不写文件。
6. `write-project.ts` 负责空目录检查和写入。

**验收:**

- `--dry-run` 可以输出 React 默认项目的文件列表。
- 非空目录会失败。

### Task 4：实现 package.json 合并与 snippet 渲染

**Files:**

- Create: `generator/src/engine/build-package-json.ts`
- Create: `generator/src/engine/render-snippet.ts`
- Create: `generator/src/engine/commands.ts`

**步骤:**

1. 合并 deps/devDeps 时去重，冲突时报错。
2. scripts 根据 stack 与 tests/build tool 生成。
3. snippet 渲染只替换白名单 placeholder。
4. commands 输出 `auto` / `announce`，不直接执行安装，除非后续单独加 `--install`。

**验收:**

- `package.json` 不出现重复依赖。
- 未替换 placeholder 会让 dry-run 失败。

### Task 5：新增 theme snippets 与矩阵接入

**Files:**

- Create: `shared/snippets/theme/*`
- Modify: `workflows/options/global.options.json`
- Modify: `workflows/options/vue.options.json`
- Modify: `workflows/options/react.options.json`
- Modify: `workflows/options/react-native.options.json`
- Modify: `workflows/options/electron.options.json`
- Modify: `workflows/options/node-fullstack.options.json`
- Modify: `shared/snippets/project-docs/AGENT.md.tmpl`
- Modify: `shared/snippets/project-docs/CLAUDE.md.tmpl`

**步骤:**

1. 生成 Web theme storage/provider/toggle。
2. 生成 RN theme provider，接入 `Appearance` 与 preferences。
3. AGENT/CLAUDE 模板增加 Theme 行和 theme 规则。
4. 生成器根据 stack 自动选择对应 snippets。
5. `tokens.shadcn.css` 保持兼容，必要时扩展 dark token。

**验收:**

- React/Vue 默认脚手架生成 theme provider 和切换入口。
- RN 不使用 web-only API。
- API-only node-fullstack 不生成 theme 文件。

### Task 6：新增 i18n snippets 与矩阵接入

**Files:**

- Create: `shared/snippets/i18n/vue/*`
- Create: `shared/snippets/i18n/react/*`
- Create: `shared/snippets/i18n/react-native/*`
- Modify: `workflows/options/global.options.json`
- Modify: `shared/snippets/project-docs/AGENT.md.tmpl`
- Modify: `shared/snippets/project-docs/CLAUDE.md.tmpl`

**步骤:**

1. 为 Vue 接入 `vue-i18n`。
2. 为 React 接入 `i18next`、`react-i18next`。
3. 为 RN 接入 `expo-localization`、`i18next`、`react-i18next`。
4. 生成 zh-CN/en-US 默认语言包。
5. 增加 locale key 命名约束：按 feature 分组，不允许散落字符串。

**验收:**

- 启用 i18n 后，首页占位文案来自 locale 文件。
- 不启用 i18n 时，不增加 i18n 依赖。

### Task 7：更新 `/new-project` workflow

**Files:**

- Modify: `workflows/new-project.md`
- Modify: `.claude/commands/new-project.md`
- Modify: `README.md`

**步骤:**

1. Stage 2 增加全局定制：theme / i18n。
2. Stage 3 summary 表新增 Theme / Theme preset / i18n / Locales。
3. Stage 4 写入逻辑说明改为优先使用 generator schema。
4. 保留文本模式“一次只问一个问题”的约束。
5. 说明 AI-only 模式和 generator CLI 模式的等价关系。

**验收:**

- 不破坏现有 Codex memory 指令。
- 用户仍可只选 defaults 快速生成项目。

### Task 8：测试与快照

**Files:**

- Create: `generator/src/tests/resolve-config.test.ts`
- Create: `generator/src/tests/build-file-plan.test.ts`
- Create: `generator/src/tests/snapshots/*.snap`
- Create: `generator/src/tests/fixtures/*.json`

**步骤:**

1. 测试每个 stack 的默认 ResolvedConfig。
2. 测试 React + theme + i18n 文件计划。
3. 测试 Vue + theme-only 文件计划。
4. 测试 RN + i18n 不引入 web-only snippets。
5. 测试 Electron renderer delegation。
6. 测试 node-fullstack API-only 不生成 web theme/i18n。

**验收:**

- `pnpm --dir generator test` 通过。
- 更新 matrix/options 时快照能提示生成差异。

### Task 9：端到端验证

**Files:**

- Create: `docs/scaffold-generator.md`
- Modify: `README.md`

**步骤:**

1. 在 `tmp/` 或 scratch 目录生成 React 默认项目。
2. 生成 Vue + i18n 项目。
3. 生成 RN 默认项目 dry-run。
4. 生成 node-fullstack API-only dry-run。
5. 记录每个组合的命令输出和已知限制。

**验收:**

- Web 项目至少能 `typecheck` 和 `build`。
- dry-run 输出的 commands 与 workflow Stage 5 报告一致。

## 迁移策略

第一阶段不要一次性把 Markdown 矩阵删除或完全替换。推荐顺序：

1. 先新增 schema/options/generator，不改变 `/new-project` 行为。
2. 让 generator dry-run 与现有矩阵默认输出对齐。
3. 再修改 workflow，让 AI 在有本地 generator 时优先使用 generator。
4. 最后把 theme/i18n 纳入默认问答和项目级文档。

## 风险与处理

- Markdown 与 JSON options 双源漂移：给 options 加测试，并在 Markdown 顶部声明 JSON 为机器源。
- 依赖版本漂移：保留矩阵的 Version baseline，并增加季度验证任务。
- theme 在 Web/RN 的实现差异：用 stack-specific snippets，不抽象成一个通用实现。
- i18n 对 Next server/client 边界复杂：第一阶段只生成 client provider，不做 server translation。
- Electron/Node nested stack 容易重复生成 AGENT/CLAUDE：沿用现有规则，根项目只写一份项目契约。

## Definition of Done

- `plan.md` 中列出的 schema/options/generator 基础文件已落地。
- 5 个 stack 的默认配置都能 resolve。
- React/Vue/RN 至少各有一个 theme 或 i18n 快照测试。
- Electron 与 node-fullstack 的 nested generation 不重复写根文档。
- README 同时说明 AI workflow 和 CLI generator 两种使用方式。
- 新生成项目的 AGENT/CLAUDE 能显示 theme/i18n 选择，并约束后续开发使用这些配置。
