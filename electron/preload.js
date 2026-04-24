const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopApi", {
  openFile: () => ipcRenderer.invoke("open-file")
});
