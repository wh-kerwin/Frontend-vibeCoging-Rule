# New Project Workflow Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the default project presets deterministic and runnable, then turn the workflow and skill into thin orchestration layers over that generator.

**Architecture:** Treat JSON options and schemas as the operational source of truth. The TypeScript generator resolves and validates configuration, builds root and nested file plans, and verifies output contracts. Markdown matrices remain human-readable references, while the skill bundles a synchronized offline snapshot and delegates generation to the same engine.

**Tech Stack:** TypeScript, Commander, AJV, Vitest, Markdown skills.

---

### Task 1: Lock down generator contracts

**Files:**
- Modify: `generator/src/tests/build-file-plan.test.ts`
- Create: `generator/src/tests/validate-config.test.ts`

- [ ] Add failing tests that require runnable entry/config files for Vue, React, and React Native.
- [ ] Add failing tests that require prefixed nested renderer/web files for Electron and Node full-stack.
- [ ] Add failing tests that reject choices belonging to another stack.
- [ ] Run `npm test` and confirm failures are caused by missing generation and validation behavior.

### Task 2: Repair configuration and file planning

**Files:**
- Modify: `generator/src/config/validate-config.ts`
- Modify: `generator/src/config/resolve-config.ts`
- Modify: `generator/src/engine/build-file-plan.ts`
- Modify: `generator/src/engine/build-package-json.ts`
- Modify: `generator/src/cli.ts`

- [ ] Validate every selected dimension and choice against the selected stack options.
- [ ] Generate deterministic default entry files and framework configuration.
- [ ] Recursively prefix nested renderer/web plans and merge the required package metadata.
- [ ] Fix interactive prompt response typing.
- [ ] Run unit tests and typecheck until green.

### Task 3: Make the skill bundle deterministic

**Files:**
- Create: `skills/new-project/scripts/validate-bundle.mjs`
- Create: `skills/new-project/agents/openai.yaml`
- Modify: `skills/new-project/SKILL.md`
- Delete: `skills/new-project/REFERENCE.md`
- Modify: `generator/package.json`

- [ ] Add a script that compares bundled boundaries, matrices, and snippets with canonical repository files.
- [ ] Replace the duplicated 457-line skill with a concise orchestration workflow.
- [ ] Add Codex-facing skill metadata and remove duplicated offline documentation.
- [ ] Run bundle and skill validators.

### Task 4: Align workflow and documentation

**Files:**
- Modify: `workflows/new-project.md`
- Modify: `README.md`
- Modify: `docs/scaffold-generator.md`

- [ ] Define JSON options plus schemas as the operational source and the generator as the only writer.
- [ ] Fix nested UI/CSS questions, project naming, fast/default mode, and targeted revisions.
- [ ] Remove claims contradicted by implementation and document verification commands.

### Task 5: End-to-end verification

- [ ] Run `npm test`, `npm run typecheck`, and `npm run build` in `generator/`.
- [ ] Run dry-runs for all five stacks and inspect required paths.
- [ ] Run skill bundle validation and `quick_validate.py`.
- [ ] Search generated plans and bundled files for unresolved placeholders or stale `AGENT.md` output names.
