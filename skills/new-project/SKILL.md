---
name: new-project
description: Interactive workflow to scaffold a new frontend project. Asks for project type (Vue/React/React Native/Electron/Node full-stack), UI library, atomic CSS, and package manager, then generates a complete, runnable project assembled from canonical frontend-rules boundaries and snippets. Use when the user says "/new-project", "create a new project", "scaffold a project", "bootstrap a frontend app", or asks to start a new frontend project from scratch.
---

# /new-project — Frontend Project Scaffolding

## What this skill does

Generates a complete frontend project tailored to the user's tech choices. The project is assembled from engineering rules, tech matrices, and code snippets maintained in the canonical frontend-rules repo.

## Execution

When invoked, fetch and execute the master workflow:

1. **Fetch** `workflows/new-project.md` from the canonical repo:
   - RAW: `https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/workflows/new-project.md`
   - Fallback API: `https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/workflows/new-project.md` (base64-decode `content`)
2. **Execute it literally, end-to-end.** Do not skip stages, paraphrase option labels, or invent questions. The workflow file is the single source of truth.
3. For every referenced file (`boundaries/**`, `workflows/matrices/**`, `shared/snippets/**`), fetch on-demand using the same RAW → API fallback chain.

## Repo source

```
GitHub:    wh-kerwin/Frontend-vibeCoging-Rule (branch: main)
RAW base:  https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base:  https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

If the user's AI tool memory overrides the repo (fork/branch), use the override.

## Local dev mode

If `FRONTEND_RULES_ROOT` env var is set, read files from that local path instead of fetching from GitHub. This is for users editing the rules themselves.

## Offline fallback

If both RAW and API fetches fail, read [REFERENCE.md](REFERENCE.md) in this skill directory for a condensed version of the workflow. It won't have the full matrix data, but provides enough to ask the mandatory questions and generate basic project structure.

## Supported stacks

- Vue 3 (Vite + SFC + composables)
- React (Vite or Next.js)
- React Native (Expo)
- Electron (hardened main + preload + renderer)
- Node full-stack monorepo

## Post-generation

After generating the project, the workflow writes `AGENT.md` and `CLAUDE.md` into the project root. These encode the per-project stack choices and the "use the UI library, don't hand-roll" rule for future AI sessions.
