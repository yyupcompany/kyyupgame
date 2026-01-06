const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { DatabaseManager } = require('./database');
const { ServerManager } = require('./server');

class DesktopApp {
  constructor() {
    this.mainWindow = null;
    this.databaseManager = new DatabaseManager();
    this.serverManager = new ServerManager();
    this.serverPort = null;

    this.setupApp();
  }

  setupApp() {
    // 设置应用程序用户模型ID（Windows）
    if (process.platform === 'win32') {
      app.setAppUserModelId('com.kindergarten.desktop');
    }

    // 只允许一个实例
    const gotTheLock = app.requestSingleInstanceLock();
    if (!gotTheLock) {
      app.quit();
      return;
    }

    app.on('second-instance', () => {
      // 当运行第二个实例时，将焦点放在主窗口上
      if (this.mainWindow) {
        if (this.mainWindow.isMinimized()) this.mainWindow.restore();
        this.mainWindow.focus();
      }
    });

    // 应用程序事件
    app.whenReady().then(() => {
      this.init();
    });

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createMainWindow();
      }
    });

    app.on('before-quit', () => {
      this.cleanup();
    });
  }

  async init() {
    try {
      console.log('🚀 启动幼儿园管理系统桌面版...');

      // 初始化数据库
      await this.databaseManager.init();
      console.log('✅ 数据库初始化完成');

      // 启动内置服务器
      await this.serverManager.start();
      this.serverPort = this.serverManager.port;
      console.log(`✅ 内置服务器启动在端口 ${this.serverPort}`);

      // 创建主窗口
      await this.createMainWindow();

      // 设置菜单
      this.setupMenu();

      // 设置IPC通信
      this.setupIPC();

      console.log('🎉 应用启动完成！');

    } catch (error) {
      console.error('❌ 应用启动失败:', error);
      this.showErrorDialog('应用启动失败', error.message);
      app.quit();
    }
  }

  async createMainWindow() {
    // 创建浏览器窗口
    this.mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      show: false,
      autoHideMenuBar: true,
      icon: path.join(__dirname, '../../public/icon.png'),
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
        preload: path.join(__dirname, '../preload/index.js')
      }
    });

    // 加载应用
    if (app.isPackaged) {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    } else {
      // 开发模式加载本地服务器
      this.mainWindow.loadURL('http://localhost:5174');

      // 开发模式打开开发者工具
      this.mainWindow.webContents.openDevTools();
    }

    // 窗口事件
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow.show();
      this.mainWindow.center();

      // 发送服务器端口信息给渲染进程
      this.mainWindow.webContents.send('server-ready', {
        port: this.serverPort,
        apiBase: `http://localhost:${this.serverPort}/api`
      });
    });

    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
    });

    // 处理外部链接
    this.mainWindow.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // 阻止导航到外部链接
    this.mainWindow.webContents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);

      if (parsedUrl.origin !== 'http://localhost:5174' &&
          parsedUrl.origin !== `http://localhost:${this.serverPort}`) {
        event.preventDefault();
        shell.openExternal(navigationUrl);
      }
    });
  }

  setupMenu() {
    const template = [
      {
        label: '文件',
        submenu: [
          {
            label: '数据导入/导出',
            accelerator: 'CmdOrCtrl+I',
            click: () => {
              this.mainWindow.webContents.send('menu-data-import-export');
            }
          },
          { type: 'separator' },
          {
            label: '退出',
            accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
            click: () => {
              app.quit();
            }
          }
        ]
      },
      {
        label: '编辑',
        submenu: [
          { role: 'undo', label: '撤销' },
          { role: 'redo', label: '重做' },
          { type: 'separator' },
          { role: 'cut', label: '剪切' },
          { role: 'copy', label: '复制' },
          { role: 'paste', label: '粘贴' }
        ]
      },
      {
        label: '视图',
        submenu: [
          { role: 'reload', label: '重新加载' },
          { role: 'forceReload', label: '强制重新加载' },
          { role: 'toggleDevTools', label: '开发者工具' },
          { type: 'separator' },
          { role: 'resetZoom', label: '实际大小' },
          { role: 'zoomIn', label: '放大' },
          { role: 'zoomOut', label: '缩小' },
          { type: 'separator' },
          { role: 'togglefullscreen', label: '全屏' }
        ]
      },
      {
        label: '工具',
        submenu: [
          {
            label: '数据库管理',
            click: () => {
              this.mainWindow.webContents.send('menu-database-manage');
            }
          },
          {
            label: '系统设置',
            click: () => {
              this.mainWindow.webContents.send('menu-system-settings');
            }
          },
          {
            label: '查看日志',
            click: () => {
              this.openLogDirectory();
            }
          }
        ]
      },
      {
        label: '帮助',
        submenu: [
          {
            label: '关于',
            click: () => {
              this.showAboutDialog();
            }
          },
          {
            label: '用户手册',
            click: () => {
              shell.openExternal('https://docs.kindergarten.com');
            }
          }
        ]
      }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }

  setupIPC() {
    // 文件操作
    ipcMain.handle('select-file', async (event, options) => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openFile'],
        filters: options.filters || [
          { name: '所有文件', extensions: ['*'] }
        ]
      });
      return result;
    });

    ipcMain.handle('select-directory', async () => {
      const result = await dialog.showOpenDialog(this.mainWindow, {
        properties: ['openDirectory']
      });
      return result;
    });

    ipcMain.handle('save-file', async (event, defaultPath, filters) => {
      const result = await dialog.showSaveDialog(this.mainWindow, {
        defaultPath,
        filters: filters || [
          { name: '所有文件', extensions: ['*'] }
        ]
      });
      return result;
    });

    // 数据库操作
    ipcMain.handle('database-backup', async () => {
      return await this.databaseManager.backup();
    });

    ipcMain.handle('database-restore', async (event, filePath) => {
      return await this.databaseManager.restore(filePath);
    });

    ipcMain.handle('database-stats', async () => {
      return await this.databaseManager.getStats();
    });

    // 系统信息
    ipcMain.handle('get-app-version', () => {
      return app.getVersion();
    });

    ipcMain.handle('get-platform', () => {
      return process.platform;
    });

    // 窗口控制
    ipcMain.handle('minimize-window', () => {
      if (this.mainWindow) {
        this.mainWindow.minimize();
      }
    });

    ipcMain.handle('maximize-window', () => {
      if (this.mainWindow) {
        if (this.mainWindow.isMaximized()) {
          this.mainWindow.unmaximize();
        } else {
          this.mainWindow.maximize();
        }
      }
    });

    ipcMain.handle('close-window', () => {
      if (this.mainWindow) {
        this.mainWindow.close();
      }
    });

    // 通知
    ipcMain.handle('show-notification', (event, options) => {
      const notification = new Notification({
        title: options.title || '幼儿园管理系统',
        body: options.body,
        icon: path.join(__dirname, '../../public/icon.png')
      });
      notification.show();
    });
  }

  openLogDirectory() {
    const logPath = path.join(app.getPath('userData'), 'logs');
    if (!fs.existsSync(logPath)) {
      fs.mkdirSync(logPath, { recursive: true });
    }
    shell.openPath(logPath);
  }

  showAboutDialog() {
    dialog.showMessageBox(this.mainWindow, {
      type: 'info',
      title: '关于幼儿园管理系统',
      message: '幼儿园管理系统',
      detail: `版本: ${app.getVersion()}\n平台: ${process.platform}\nNode.js: ${process.versions.node}\nElectron: ${process.versions.electron}\n\n专业的幼儿园综合管理平台\n\n© 2025 Kindergarten Team`,
      buttons: ['确定']
    });
  }

  showErrorDialog(title, message) {
    dialog.showErrorBox(title, message);
  }

  async cleanup() {
    console.log('🧹 清理资源...');

    try {
      if (this.serverManager) {
        await this.serverManager.stop();
      }

      if (this.databaseManager) {
        await this.databaseManager.close();
      }

      console.log('✅ 资源清理完成');
    } catch (error) {
      console.error('❌ 资源清理失败:', error);
    }
  }
}

// 创建应用实例
new DesktopApp();