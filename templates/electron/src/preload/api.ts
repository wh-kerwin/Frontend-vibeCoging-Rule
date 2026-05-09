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

