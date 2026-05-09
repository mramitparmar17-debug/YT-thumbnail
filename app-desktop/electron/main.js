const { app, BrowserWindow } = require('electron')
function createWindow(){
  const win = new BrowserWindow({ width: 1280, height: 800, webPreferences: { preload: __dirname + '/preload.js', contextIsolation: true, nodeIntegration: false } })
  win.loadURL(process.env.ELECTRON_START_URL || 'http://localhost:5173')
}
app.whenReady().then(createWindow)
