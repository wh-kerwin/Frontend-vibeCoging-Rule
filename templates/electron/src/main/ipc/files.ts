import { dialog, ipcMain } from 'electron'

export function registerFileIpc() {
  ipcMain.handle('files:pick-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
    })

    return result.canceled ? null : result.filePaths[0]
  })
}

