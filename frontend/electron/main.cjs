const { app, BrowserWindow, ipcMain, shell } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

const createMainWindow = () => {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    kiosk: true,
    fullscreen: true,
    autoHideMenuBar: true,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  win.setMenuBarVisibility(false)

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  win.webContents.on('will-navigate', (event, url) => {
    const allowedOrigin = isDev ? 'http://localhost:5173' : 'file://'
    if (!url.startsWith(allowedOrigin)) {
      event.preventDefault()
    }
  })

  if (isDev) {
    win.loadURL(process.env.ELECTRON_START_URL || 'http://localhost:5173')
    return
  }

  win.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(() => {
  createMainWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('kiosk:print', async (_event, options) => {
  const focused = BrowserWindow.getFocusedWindow()
  if (!focused) {
    return false
  }

  return new Promise((resolve) => {
    focused.webContents.print(
      {
        silent: Boolean(options?.silent),
        printBackground: true,
      },
      (success) => resolve(success),
    )
  })
})

