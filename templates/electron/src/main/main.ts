import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { registerFileIpc } from './ipc/files'

// ── Constants ────────────────────────────────────────────────────────────────

const isDev = !app.isPackaged
const RENDERER_URL = 'http://localhost:5173'
const PRELOAD_PATH = path.join(__dirname, '../preload/index.js')

// ── Window factory ───────────────────────────────────────────────────────────

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false, // avoid flash; reveal on 'ready-to-show'
    webPreferences: {
      preload: PRELOAD_PATH,
      // Security baseline – never relax these without a documented reason.
      contextIsolation: true,   // renderer cannot access Node APIs directly
      nodeIntegration: false,   // renderer has no require()
      sandbox: true,            // renderer runs in OS sandbox
      webSecurity: true,
      allowRunningInsecureContent: false,
    },
  })

  // Open external links in the OS browser, not in the app window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://')) shell.openExternal(url)
    return { action: 'deny' }
  })

  win.once('ready-to-show', () => win.show())

  if (isDev) {
    win.loadURL(RENDERER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../../renderer/index.html'))
  }

  return win
}

// ── App lifecycle ─────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  // Register all IPC handlers before creating the window.
  registerFileIpc()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── Security hardening ────────────────────────────────────────────────────────

// Prevent navigation to unexpected origins.
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, url) => {
    const allowed = isDev ? [RENDERER_URL] : ['file://']
    if (!allowed.some((origin) => url.startsWith(origin))) {
      event.preventDefault()
    }
  })
})
