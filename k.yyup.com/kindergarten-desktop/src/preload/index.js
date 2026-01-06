const { contextBridge, ipcRenderer } = require('electron');

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 应用信息
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  // 窗口控制
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),

  // 文件操作
  selectFile: (options) => ipcRenderer.invoke('select-file', options),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveFile: (defaultPath, filters) => ipcRenderer.invoke('save-file', defaultPath, filters),

  // 数据库操作
  databaseBackup: () => ipcRenderer.invoke('database-backup'),
  databaseRestore: (filePath) => ipcRenderer.invoke('database-restore', filePath),
  databaseStats: () => ipcRenderer.invoke('database-stats'),

  // 通知
  showNotification: (options) => ipcRenderer.invoke('show-notification', options),

  // 监听主进程事件
  onServerReady: (callback) => ipcRenderer.on('server-ready', callback),
  onMenuDataImportExport: (callback) => ipcRenderer.on('menu-data-import-export', callback),
  onMenuDatabaseManage: (callback) => ipcRenderer.on('menu-database-manage', callback),
  onMenuSystemSettings: (callback) => ipcRenderer.on('menu-system-settings', callback),

  // 移除监听器
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// 开发模式下暴露一些调试API
if (process.env.NODE_ENV === 'development') {
  contextBridge.exposeInMainWorld('electronDebug', {
    openDevTools: () => ipcRenderer.send('open-dev-tools'),
    reload: () => ipcRenderer.send('reload'),
    clearCache: () => ipcRenderer.send('clear-cache')
  });
}

// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('渲染进程错误:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('未处理的Promise拒绝:', event.reason);
});