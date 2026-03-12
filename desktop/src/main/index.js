/**
 * 🦞 龙虾 Agent - Electron 主进程
 * 支持 macOS / Windows / Linux
 */

const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

// 初始化配置存储
const store = new Store();

// 全局窗口引用
let mainWindow = null;
let tray = null;

// 窗口配置
const windowConfig = {
  width: store.get('window.width', 1200),
  height: store.get('window.height', 800),
  minWidth: 800,
  minHeight: 600,
  show: false,
  webPreferences: {
    nodeIntegration: false,
    contextIsolation: true,
    preload: path.join(__dirname, '../preload/index.js'),
    webviewTag: true
  }
};

// macOS 特定配置
if (process.platform === 'darwin') {
  app.dock.hide(); // 隐藏 dock 图标 (使用菜单栏)
}

/**
 * 创建主窗口
 */
function createWindow() {
  mainWindow = new BrowserWindow(windowConfig);

  // 加载应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Web 开发服务器
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口准备好后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.focus();
  });

  // 保存窗口大小
  mainWindow.on('resize', () => {
    const [width, height] = mainWindow.getSize();
    store.set('window.width', width);
    store.set('window.height', height);
  });

  // 关闭窗口
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/**
 * 创建系统托盘
 */
function createTray() {
  // 托盘图标
  const iconPath = path.join(__dirname, '../../resources/icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  const trayIcon = icon.resize({ width: 16, height: 16 });

  tray = new Tray(trayIcon);

  // 托盘菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '打开龙虾 Agent',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    {
      label: '检查更新',
      click: () => {
        // TODO: 检查更新
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);

  // 点击托盘图标
  tray.on('click', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // 鼠标悬停提示
  tray.setToolTip('龙虾 Agent - 你的 AI 智能助手');
}

/**
 * 注册全局快捷键
 */
function registerShortcuts() {
  // 全局快捷键：Cmd/Ctrl + Shift + L
  const ret = globalShortcut.register('CommandOrControl+Shift+L', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  if (!ret) {
    console.log('快捷键注册失败');
  }
}

// Electron 就绪
app.whenReady().then(() => {
  createWindow();
  createTray();
  registerShortcuts();
});

// 所有窗口关闭
app.on('window-all-closed', () => {
  // macOS 通常保持运行
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// macOS 激活
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// 退出前清理
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

// IPC 通信处理
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-platform', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version
  };
});

ipcMain.handle('minimize-window', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.handle('maximize-window', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('close-window', () => {
  if (mainWindow) mainWindow.close();
});

// 单实例锁定 (防止多开)
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // 另一个实例启动，聚焦到当前窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
