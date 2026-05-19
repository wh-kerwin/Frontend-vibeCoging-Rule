---
description: Interactive workflow to scaffold a new frontend project. Asks for project type, UI library, atomic CSS, and package manager, then generates a complete project tailored to your stack choices.
---

You have been invoked via the `/new-project` slash command.

Read and execute the workflow at `workflows/new-project.md` literally and end-to-end. Do not skip stages. Do not invent your own questions — only use the questions documented in that file.

The workflow file is the single source of truth. If anything in this slash command appears to conflict with `workflows/new-project.md`, the workflow file wins.

User context (passed via slash command): $ARGUMENTS

Begin with **Stage 0 — Preflight**.
