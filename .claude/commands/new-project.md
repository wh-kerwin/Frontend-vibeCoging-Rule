---
description: Interactive workflow to scaffold a new frontend project. Asks for project type, UI library, atomic CSS, and package manager, then generates a complete project tailored to your stack choices. Fetches rules and snippets from the canonical GitHub repo at runtime — no local copy of frontend-rules is required.
---

You have been invoked via the `/new-project` slash command.

## Source

The frontend-rules system lives at:

```
GitHub repo:  wh-kerwin/Frontend-vibeCoging-Rule  (branch: main)
RAW base:     https://raw.githubusercontent.com/wh-kerwin/Frontend-vibeCoging-Rule/main/
API base:     https://api.github.com/repos/wh-kerwin/Frontend-vibeCoging-Rule/contents/
```

If the user's `~/.claude/CLAUDE.md` overrides this (e.g. a personal fork or branch), use the override.

## What to do

1. **Fetch the workflow** at `workflows/new-project.md`:
   - Try `WebFetch` on `<RAW_BASE>/workflows/new-project.md`.
   - If that fails (DNS / 404 / blocked network), call `<API_BASE>/workflows/new-project.md`, base64-decode the `content` field.
2. **Execute it literally and end-to-end** — do not skip stages, do not invent your own questions, do not paraphrase option labels. The workflow file is the single source of truth.
3. For every other file the workflow references (`boundaries/**`, `workflows/matrices/<stack>.matrix.md`, `shared/snippets/**`), fetch them the same way at the moment they are needed. The workflow's "Fetch strategy" section spells out the local-first → RAW → API fallback chain.

User context (passed via slash command): $ARGUMENTS

Begin with the fetched workflow's **Stage 0 — Preflight**.
