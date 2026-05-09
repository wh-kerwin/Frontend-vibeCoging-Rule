# Frontend Rules

这是一套面向 AI Agent 与真人开发者共同使用的前端开发规范体系。目标是把“vibe coding”的速度感，落到可复制、可审查、可长期维护的工程约束中。

## 入口文件

- `AGENT.md`: AI Agent 的主规范。
- `CLAUDE.md`: Claude/Cursor 类编码助手的项目指令。
- `projects.rules`: 大模型可读的规则声明。
- `design.md`: 做项目时给 AI 读取的视觉设计系统，可按需切换 `awesome-design-md` 中的某个项目风格。
- `shared/`: 跨技术栈通用规范。
- `stacks/`: 不同技术栈的架构方案。
- `templates/`: 可复制到项目中的示例文件。

## 技术栈

- Vue 3 + Vite + Tailwind + shadcn/vue + UnoCSS: `stacks/vue/ARCHITECTURE.md`
- React Web (Vite / Next.js): `stacks/react/ARCHITECTURE.md`
- Node 全栈 (Hono + Prisma/Drizzle): `stacks/node-fullstack/ARCHITECTURE.md`
- Electron 桌面端: `stacks/electron/ARCHITECTURE.md`
- React Native (Expo): `stacks/react-native/ARCHITECTURE.md`

## 使用方式

新项目优先复制对应 `templates/<stack>/` 下的文件，再按 `stacks/<stack>/ARCHITECTURE.md` 调整。已有项目则先让 AI 读取 `AGENT.md`、对应架构文档和 `shared/` 中的约束，再进行局部改造。

## 核心原则

- 先做能跑通的最小完整体验。
- 目录、命名、状态、请求、样式都要稳定可预测。
- 公共抽象必须来自真实重复，而不是预判。
- 所有外部输入必须在边界校验。
- UI 不只做成功态，必须覆盖 loading、empty、error、success。
