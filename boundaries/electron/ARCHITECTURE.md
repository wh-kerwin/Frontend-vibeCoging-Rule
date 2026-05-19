# Electron Desktop Architecture

Default stack and version pins live in `workflows/matrices/electron.matrix.md`. Renderer framework choice (Vue vs React) delegates to the corresponding stack matrix.

## Process Boundaries

```txt
src/
  main/                  # OS integration, filesystem, lifecycle, background services
    main.ts              # from shared/snippets/electron/main.security.ts
    windows/
    ipc/                 # named typed channels (one file per feature)
    services/
  preload/               # the only bridge between main and renderer
    index.ts             # from shared/snippets/electron/preload.bridge.ts
    api.ts               # DesktopApi interface — typed contract
  renderer/              # UI only — delegates to vue/ or react/ matrix
    app/
    features/
    shared/
```

Main owns side effects. Renderer owns UI. Preload exposes a small typed API. **The renderer never imports from `electron`.**

## Security Rules

See `boundaries/electron/security-checklist.md` for the full hard-rule list. Every `BrowserWindow` must satisfy that checklist before merge.

## IPC Pattern

- One file per IPC channel group under `src/main/ipc/<group>.ts`.
- Each channel is named (`'<group>:<action>'`) and registered with `ipcMain.handle`.
- Preload calls `ipcRenderer.invoke(channel, payload)` and types the result.
- Payloads are validated with Zod in main before any side effect runs.
- Use request-response (`handle`/`invoke`) for commands; use a subscription channel for long-running state streams.

```ts
// main side
ipcMain.handle('files:pick-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result.canceled ? null : result.filePaths[0]
})

// preload exposes window.desktop.files.pickDirectory()
// renderer calls window.desktop.files.pickDirectory() — never imports electron
```

## Storage

- User preferences: app config file or `electron-store`.
- Large local data: SQLite (better-sqlite3 / libsql).
- Secrets: OS keychain via a vetted library (`keytar`, `electron-store` encrypted, or platform-specific).
- Cache: app cache directory with explicit cleanup.

## Updates

Keep update logic in main. Renderer can display update state but cannot decide install paths or execute binaries.

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm electron:build
```

## Generate a Project

Run `/new-project` (Claude Code) or follow `workflows/new-project.md`. Defaults in `workflows/matrices/electron.matrix.md` — the workflow asks separately which framework the renderer uses and pulls from `workflows/matrices/vue.matrix.md` or `react.matrix.md` accordingly.
