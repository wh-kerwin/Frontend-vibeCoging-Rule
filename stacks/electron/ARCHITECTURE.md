# Electron Desktop Architecture

Target stack: Electron + TypeScript + Vite + secure preload boundary + framework renderer.

## Process Boundaries

```txt
src/
  main/
    main.ts
    windows/
    ipc/
    services/
  preload/
    index.ts
    api.ts
  renderer/
    app/
    features/
    shared/
```

Main process owns OS integration, filesystem, native menus, app lifecycle, and background services. Renderer owns UI only. Preload exposes a small typed API.

## Security Rules

These options must be set on every `BrowserWindow` — see `templates/electron/src/main/main.ts`:

- `contextIsolation: true` — renderer cannot access Node APIs directly.
- `nodeIntegration: false` — renderer has no `require()`.
- `sandbox: true` — renderer runs in OS sandbox (disable only with a documented reason).
- `webSecurity: true` / `allowRunningInsecureContent: false`.
- All IPC channels are named, typed, and documented. Validate IPC payloads in main before executing side effects.
- No direct filesystem access from renderer — always go through a named IPC channel.
- Block unexpected navigation: register a `will-navigate` handler on `web-contents-created` to allowlist origins (see `main.ts`).

## IPC Pattern

Use request-response IPC for commands and subscriptions for long-running state.

```ts
// preload exposes window.desktop.files.pickDirectory()
// renderer never imports electron directly
```

## Storage

- User preferences: app config file or electron-store wrapper.
- Large local data: SQLite.
- Secrets: OS keychain via a vetted library.
- Cache: app cache directory with explicit cleanup.

## Updates

Keep update logic in main. Renderer can show update state but cannot decide install paths or execute binaries.

## Recommended Checks

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm electron:build
```

## Template Index

| File | Purpose |
|------|---------|
| `templates/electron/src/main/main.ts` | `createWindow()` with security options + lifecycle + navigation guard |
| `templates/electron/src/main/ipc/files.ts` | IPC handler example — `dialog.showOpenDialog` |
| `templates/electron/src/preload/index.ts` | `contextBridge.exposeInMainWorld` wiring |
| `templates/electron/src/preload/api.ts` | `DesktopApi` interface + `Window` type augmentation |

