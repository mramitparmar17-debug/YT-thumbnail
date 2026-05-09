const { contextBridge } = require('electron')
contextBridge.exposeInMainWorld('desktopApi', { ping: () => 'pong' })
