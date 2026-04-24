const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  win.loadURL(devUrl);
}

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle("open-file", async () => {
    const result = await dialog.showOpenDialog({ properties: ["openFile"], filters: [{ name: "Excel", extensions: ["xls", "xlsx"] }] });
    return result.filePaths?.[0] || null;
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
