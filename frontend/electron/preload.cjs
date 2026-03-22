const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('nativeKiosk', {
  isNativeApp: true,
  print: async (options) => ipcRenderer.invoke('kiosk:print', options),
})

