import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopApi } from './api'

const api: DesktopApi = {
  // Wire up your typed IPC methods here — each one calls ipcRenderer.invoke
  // with a namespaced channel name (e.g. 'files:pick-directory').
  // The DesktopApi interface in ./api defines the renderer-facing contract.
}

contextBridge.exposeInMainWorld('desktop', api)
