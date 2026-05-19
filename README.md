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

## 创建新项目

在 Claude Code 里运行 `/new-project`,工作流会:

1. 询问你 4 个必答问题(项目类型 / UI 库 / 原子化 CSS / 包管理器)。
2. 可选深度定制(路由、状态、数据、表单、测试、动画)。
3. 查矩阵 → 组装文件 → 跑必要的 CLI → 给出生成报告与下一步。

其他 AI 工具(Cursor、Cline、Codex 等)直接读 `workflows/new-project.md`,按里面的 5 个 Stage 执行即可。

## 改造已有项目

让 AI 先读 `AGENT.md` + `boundaries/<stack>/ARCHITECTURE.md` + `boundaries/common/` 中相关文件,再进行局部改造。需要某段标准实现时,从 `shared/snippets/` 里直接复制对应文件。

## 核心原则

- 先做能跑通的最小完整体验。
- 目录、命名、状态、请求、样式都要稳定可预测。
- 公共抽象必须来自真实重复,而不是预判。
- 所有外部输入必须在边界校验。
- UI 不只做成功态,必须覆盖 loading、empty、error、success。
