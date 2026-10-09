const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  plattform: 'desktop',
  loadContent: () => ipcRenderer.invoke('content:load'),
  loadProgress: () => ipcRenderer.invoke('progress:load'),
  saveProgress: d => ipcRenderer.invoke('progress:save', d),
  exportProgress: d => ipcRenderer.invoke('progress:export', d),
  importProgress: () => ipcRenderer.invoke('progress:import'),
  changelog: () => ipcRenderer.invoke('changelog'),
  toggleFullscreen: () => ipcRenderer.invoke('win:fullscreen'),
  info: () => ipcRenderer.invoke('info')
});
