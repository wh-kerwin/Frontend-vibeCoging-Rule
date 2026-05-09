import { contextBridge, ipcRenderer } from 'electron'
import type { DesktopApi } from './api'

const api: DesktopApi = {
  files: {
    pickDirectory: () => ipcRenderer.invoke('files:pick-directory'),
  },
}

contextBridge.exposeInMainWorld('desktop', api)

