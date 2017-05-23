const { BrowserWindow, app, protocol, ipcMain, dialog } = require('electron');
const path = require('path')
const url = require('url');
const fs = require('fs');
const GetMangaList = require('./main-process/get-mangalist');
const SelectDirectory = require('./main-process/select-directory');
const logger = require('electron-log');
const isDev = require('electron-is-dev');
const AppUpdater = require('./main-process/common/auto-updater');
const mock = require('../e2e/mocks');
let client;
if (isDev && process.env.NODE_ENV === "development") {
    client = require('electron-connect').client;
}

if (process.env.SPECTRON) {
    logger.debug('Changing paths for Spectron');
    app.setPath('userData', path.resolve(app.getAppPath(), ".data"))
    mock(dialog)
}
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, appSettings;

logger.info(`process.defaultApp ${process.defaultApp}`);
logger.info(`process.resourcesPath ${process.resourcesPath}`)
logger.info('version', app.getVersion());

function createWindow() {
    let getMangaList = new GetMangaList();
    let selectDirectory = new SelectDirectory();

    // Create the browser window.    
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        titleBarStyle: 'hidden',
        frame: false,
        minWidth: 960,
        icon: path.join(__dirname, "icon.png")
    });


    getMangaList.initialize();
    selectDirectory.initializeEvents();
    // and load the index.html of the app.
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, './index.html'),
        protocol: 'file:',
        slashes: true
    }));
    logger.debug("mainWindow.id", mainWindow.id);
    var dir = path.join(app.getPath('userData'), '/images');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    // Open the DevTools.
    if (isDev) {
        mainWindow.webContents.openDevTools()
    }

    mainWindow.maximize();
    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
        mainWindow.focus();
    });

    let appUpdater = new AppUpdater(mainWindow);
    appUpdater.initialize();
    if (client) {
        client.create(mainWindow, { sendBounds: true });
    }
}



// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

app.on('ready', createWindow)