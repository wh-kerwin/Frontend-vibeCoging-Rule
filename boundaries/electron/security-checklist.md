# Electron Security Checklist

Every `BrowserWindow` and every IPC handler in this stack must satisfy this checklist before merge. These are hard rules — relaxing any of them requires an explicit comment that names the threat being accepted.

The canonical implementation is `shared/snippets/electron/main.security.ts`.

## BrowserWindow webPreferences

| Setting | Required value | Why |
|---|---|---|
| `contextIsolation` | `true` | Renderer cannot reach Node APIs through prototype pollution. |
| `nodeIntegration` | `false` | Renderer has no `require()` and cannot pull in arbitrary Node modules. |
| `sandbox` | `true` | Renderer runs in the OS process sandbox; reduces blast radius of a renderer compromise. |
| `webSecurity` | `true` | Same-origin policy stays enforced; do not disable for development convenience. |
| `allowRunningInsecureContent` | `false` | HTTPS pages cannot load HTTP assets. |
| `preload` | absolute path | A typed bridge is the only way renderer talks to main. |

## Navigation Allowlist

Register a `will-navigate` handler on `web-contents-created` and allowlist origins. Any URL not matching the allowlist is rejected.

```ts
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    const allowed = isDev ? [RENDERER_URL] : ['file://']
    if (!allowed.some((origin) => url.startsWith(origin))) {
      event.preventDefault()
    }
  })
})
```

Set `setWindowOpenHandler` to deny new windows and forward external links to the OS browser via `shell.openExternal`.

## IPC

- Every channel is named (`'<group>:<action>'`).
- Every channel is registered with `ipcMain.handle` (not `on` — handle returns a typed response and surfaces rejections to the renderer).
- Every payload is **validated in main** with Zod before any side effect runs. Do not trust the renderer.
- Channel responses are JSON-serializable (no Buffers, no native handles, no Date — convert to ISO strings).
- Sensitive operations log a structured audit record.

## Renderer Restrictions

- Renderer **never** imports `electron`.
- Renderer **never** has filesystem access. All FS work goes through a named IPC channel.
- Renderer **never** calls `eval`, `new Function(...)`, or sets `innerHTML` from untrusted data.

## Updates

Update logic lives in main. Renderer can display update state but cannot decide install paths or execute binaries.

## Secrets

- OS keychain (`keytar` or platform-equivalent) is the only place tokens/passwords are stored.
- Never write secrets to `electron-store` in plaintext, never to `localStorage`, never to app preferences.

## Verification

Before opening a PR that touches main or preload code, confirm:

- [ ] Every new `BrowserWindow` has the full `webPreferences` table set.
- [ ] Every new IPC channel has a Zod-validated payload.
- [ ] Every new URL the app can navigate to is in the allowlist.
- [ ] No `electron` import appears in `src/renderer/`.
- [ ] No new sync filesystem call runs in main without a justification comment.
