# Scaffold Generator

`generator/` 是 `frontend-rules` 的本地 CLI 脚手架生成器,与 AI workflow (`workflows/new-project.md`) 产出等价的项目结构。

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
cd generator && npm install

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

- AI workflow 读 `workflows/matrices/*.matrix.md`(Markdown) + `shared/snippets/`
- Generator CLI 读 `workflows/options/*.options.json`(JSON) + `shared/snippets/`
- 两者共享 `schemas/` 定义的输入/输出 schema
- Markdown 是面向人和 AI 的文档;JSON 是面向程序的数据源
- 两者的默认值应当一致,通过测试保证

## 已知限制

- Electron 和 node-fullstack 的 nested generation 目前只解析嵌套 config,不递归生成嵌套项目的文件
- `--merge` 模式(写入非空目录)不在第一阶段计划中
- 版本号来自 options JSON 的 `versionBaseline`,需要定期维护
