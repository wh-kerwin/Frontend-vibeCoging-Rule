# Scaffold Generator

`generator/` 是 `frontend-rules` 唯一负责写入项目文件的 CLI。AI workflow 和 Skill 只收集并确认配置,然后调用该生成器。

## 架构

```
generator/
  src/
    cli.ts                       # CLI 入口 (commander.js)
    types.ts                     # 共享类型定义
    config/
      defaults.ts                # 各 stack 默认值
      resolve-config.ts          # 输入配置 → ResolvedConfig
      validate-config.ts         # JSON Schema 校验
    matrices/
      load-matrix.ts             # 加载 workflows/options/*.options.json
    engine/
      build-file-plan.ts         # ResolvedConfig → FilePlan
      build-package-json.ts      # 合并依赖和脚本
      render-snippet.ts          # 读取 + 替换 placeholder
      write-project.ts           # 写磁盘 / dry-run 输出
      commands.ts                # 生成 post-init CLI 命令列表
    presets/
      theme.ts                   # 按 stack 生成 theme provider/toggle
      i18n.ts                    # 按 stack 生成 i18n 配置和语言包
    tests/
      fixtures/*.json            # 测试用配置文件
      resolve-config.test.ts     # 配置解析测试
      build-file-plan.test.ts    # 文件计划生成测试
```

## 数据流

```
scaffold.config.json / 交互式问答
         ↓
    ScaffoldConfig (输入)
         ↓  validate-config.ts
    验证通过
         ↓  resolve-config.ts
    ResolvedConfig (含 theme、i18n、nested)
         ↓  build-file-plan.ts
    FilePlan { files, directories, packageJson, commands }
         ↓  write-project.ts
    写入磁盘 / dry-run 输出
```

## 配置维度

### Stack 维度 (来自矩阵)

每个 stack 有各自的可选维度:

- **Vue**: uiLibrary, atomicCss, routing, state, data, forms, tests, animation
- **React**: buildTool, uiLibrary, atomicCss, routing, state, data, forms, tests, animation
- **React Native**: runtime, uiLibrary, atomicCss, routing, state, data, forms, tests, animation, secureStorage
- **Electron**: buildTool, rendererFramework, storage, tests, updates
- **Node Full-stack**: apiFramework, orm, database, webFramework, tests, contractsPackage

### 全局维度 (新增)

| 维度 | 默认值 | 说明 |
|---|---|---|
| `theme` | `light-dark-system` | 主题切换策略 |
| `themePreset` | `shadcn-neutral` | Token preset |
| `i18n` | `none` | 国际化库 |
| `defaultLocale` | `zh-CN` | 默认语言 |
| `locales` | `zh-CN, en-US` | 生成语言包的语言列表 |

## 使用方式

```bash
cd generator && npm ci

# 交互式
npx tsx src/cli.ts scaffold --target ../my-app

# 配置文件
npx tsx src/cli.ts scaffold --config path/to/config.json --target ../my-app

# 指定 stack 快速 dry-run
npx tsx src/cli.ts scaffold --stack vue --dry-run

# 运行测试
npx vitest run
```

## 与 AI Workflow 的关系

- AI workflow 读取所选 stack 的 `workflows/options/*.options.json`,生成配置并调用 Generator。
- Generator 读取 JSON options、schemas 与 `shared/snippets/`,并独占文件写入职责。
- Markdown matrix 是面向人的参考;与 JSON 冲突时以 JSON 和 schema 为准。
- Electron renderer 与 Node web 子应用通过同一 file-plan 逻辑递归生成并添加路径前缀。

## 已知限制

- `--merge` 模式不支持;目标目录必须为空或只包含 `.git/`。
- 版本号来自 options JSON 的 `versionBaseline`,需要定期维护并通过五栈生成合同测试。
- 交互式 CLI 提供基础问答;Skill/AI workflow 负责完整的逐项定制与确认体验。
