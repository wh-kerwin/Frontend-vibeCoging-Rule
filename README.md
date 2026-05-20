# Frontend Rules

这是一套面向 AI Agent 与真人开发者共同使用的前端开发规范体系。目标是把"vibe coding"的速度感,落到可复制、可审查、可长期维护的工程约束中。

## 入口文件

- `AGENT.md`: AI Agent 的主规范。
- `CLAUDE.md`: Claude/Cursor 类编码助手的项目指令。
- `projects.rules`: 大模型可读的规则声明。
- `design.md`: 视觉设计系统(可按需切换不同的设计 reference,如 VoltAgent、Vercel、Linear 等)。

## 目录布局

- `.claude/commands/new-project.md` — Claude Code 的 `/new-project` slash command 入口。
- `workflows/new-project.md` — 通用工作流协议,任何 AI 工具都能读懂照做。
- `workflows/matrices/<stack>.matrix.md` — 每个技术栈的可选项矩阵与默认组合。
- `boundaries/common/` — 跨技术栈的工程边界(命名、目录、组件化、HTTP、async UI 状态、coding style)。
- `boundaries/<stack>/ARCHITECTURE.md` — 各技术栈的架构约束。
- `shared/snippets/` — 可被工作流引用的代码片段(HTTP client、AppError、cn、tokens 等)。

## 让你的 AI 工具找到这个仓库

工作流不要求你把本仓库克隆到新项目目录 — AI 会**直接从 GitHub fetch** boundaries / snippets / matrices。但你得先告诉 AI 仓库在哪。配置一次,任意目录都能跑。

### 仓库源(canonical source)

```
GitHub:    https://github.com/wh-kerwin/Frontend-vibeCoging-Rule
Branch:    main
RAW base:  https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base:  https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

> 国内访问 `raw.githubusercontent.com` 不稳定时,工作流会自动降级到 `api.github.com/repos/.../contents/` API(返回 base64,AI 自动解码)。

### Claude Code 用户(一次性配置)

1. 把本仓库的 [.claude/commands/new-project.md](.claude/commands/new-project.md) 复制到 `~/.claude/commands/new-project.md`(变成 user-level slash command)。
   ```bash
   mkdir -p ~/.claude/commands
   curl -fsSL https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/.claude/commands/new-project.md \
     -o ~/.claude/commands/new-project.md
   ```
   降级方案(raw 不通时):
   ```bash
   gh api repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/.claude/commands/new-project.md \
     --jq '.content' | base64 -d > ~/.claude/commands/new-project.md
   ```
2. 在 `~/.claude/CLAUDE.md` 末尾追加一行 user-level memory(可选,只在你想用 fork 时需要):
   ```
   frontend-rules 仓库源:wh-kerwin/Frontend-vibeCoging-Rule(branch: main)。fetch boundaries/snippets/matrices 时用这个。
   ```
3. 之后在**任意空目录**里跑 `/new-project` 即可。

### Codex / Cursor / Cline 等其他 AI 工具

这些工具没有 slash command,但都支持 user-level memory(`~/.codex/AGENTS.md`、Cursor Rules、Cline Custom Instructions 等)。在对应 memory 文件追加:

```
当用户说 "/new-project" 或 "创建新项目" 时:
1. 通过 WebFetch 获取 https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/workflows/new-project.md
   (失败时降级到 https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/workflows/new-project.md,base64 解码 content 字段)
2. 按其内容逐 Stage 执行。每个引用到的 boundaries/、workflows/matrices/、shared/snippets/ 文件,临到需要时再 fetch,不要预读。
3. 文本模式下:每次只问一个问题,带编号选项,等用户回数字或选项名。绝不输出 YAML 或 key: a|b|c 形式。
```

之后在新项目目录里说 "/new-project" 或 "我要创建新项目"。

### 开发模式(改 frontend-rules 本身)

如果你在编辑本仓库自身的规则,设置环境变量让工作流走本地文件而非远端:

```bash
export FRONTEND_RULES_ROOT=/path/to/frontend-rules
```

工作流的 "Fetch strategy" 一节会优先用本地路径。

## 创建新项目

配好上面的 AI 工具配置后,在新项目目录:

1. **Claude Code**: 跑 `/new-project`,自动从 GitHub fetch workflow 并执行,4 个核心问题 + 可选定制问完即生成。
2. **其他文本工具**: 说 `/new-project` 或 "我要创建新项目",AI 按 memory 里的指令 fetch workflow,然后一次一题问你。

工作流会:

1. 问 4 个必答(项目类型 / UI 库 / 原子化 CSS / 包管理器)。
2. 可选深度定制(路由、状态、数据、表单、测试、动画)。
3. 查矩阵 → 组装文件 → 跑必要的 CLI → 给出生成报告与下一步。

## 改造已有项目

让 AI 先读 `AGENT.md` + `boundaries/<stack>/ARCHITECTURE.md` + `boundaries/common/` 中相关文件,再进行局部改造。需要某段标准实现时,从 `shared/snippets/` 里直接复制对应文件(同样支持远端 fetch)。

## 核心原则

- 先做能跑通的最小完整体验。
- 目录、命名、状态、请求、样式都要稳定可预测。
- 公共抽象必须来自真实重复,而不是预判。
- 所有外部输入必须在边界校验。
- UI 不只做成功态,必须覆盖 loading、empty、error、success。
