// EXAMPLE — replace these methods with the IPC surface your renderer needs.
// Every method here must be implemented in shared/snippets/electron/preload.bridge.ts
// and have a matching ipcMain.handle('<channel>', ...) registered in main.

export interface DesktopApi {
  files: {
    pickDirectory: () => Promise<string | null>
  }
}

declare global {
  interface Window {
    desktop: DesktopApi
  }
}
