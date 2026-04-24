const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('desktopMeta', {
  appName: 'CRM Analyzer Desktop',
  runtime: process.versions
});
