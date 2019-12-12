/* global __static */
import path from 'path';
import {
  app,
  protocol,
  Menu,
  BrowserWindow,
  session,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import {
  createProtocol,
  installVueDevtools,
} from 'vue-cli-plugin-electron-builder/lib';
import settingsStore from './settings';

const isDevelopment = process.env.NODE_ENV !== 'production';

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }]);

function createWindow() {
  let { width, height } = settingsStore.get('windowBounds');

  // Menu.setApplicationMenu(null);

  // Create the browser window.
  win = new BrowserWindow({
    width,
    height,
    icon: path.join(__static, 'icon.png'),
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    },
  });

  win.setAutoHideMenuBar(true);
  win.setMenuBarVisibility(false);

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol('app');
    // Load the index.html when not in development
    win.loadURL('app://./index.html');
    setTimeout(() => {
      autoUpdater.checkForUpdatesAndNotify();
    }, 6000);
  }

  win.on('resize', () => {
    ({ width, height } = win.getBounds());
    settingsStore.set('windowBounds', { width, height });
  });

  win.on('closed', () => {
    win = null;
  });
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders['User-Agent'] = 'Beenius Android HTTP Client';
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
    try {
      await installVueDevtools();
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

autoUpdater.on('checking-for-update', () => {
  win.webContents.send('update', 'Checking for update...', 0);
});
autoUpdater.on('update-available', () => {
  win.webContents.send('update', 'Update available. Starting...', 0);
});
autoUpdater.on('update-not-available', () => {
  win.webContents.send('update', 'Up to date.', 1);
});
autoUpdater.on('error', (err) => {
  win.webContents.send('update', `Update error. ${err}`, 2);
});
autoUpdater.on('download-progress', (progressObj) => {
  win.webContents.send('update', `Downloading... ${progressObj.percent}%`, 0);
});
autoUpdater.on('update-downloaded', () => {
  win.webContents.send('update', 'Update downloaded. Restart now.', 1);
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}
