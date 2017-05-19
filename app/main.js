const { BrowserWindow, app, protocol, ipcMain } = require('electron');
const path = require('path')
const url = require('url');
const fs = require('fs');
const GetMangaList = require('./main-process/get-mangalist');
const SelectDirectory = require('./main-process/select-directory');
const logger = require('electron-log');
const { autoUpdater } = require("electron-updater");
// const client = require('electron-connect').client;
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow, appSettings;

logger.info(`process.defaultApp ${process.defaultApp}`);
logger.info(`process.resourcesPath ${process.resourcesPath}`)

autoUpdater.logger = logger;
autoUpdater.logger.transports.file.level = 'info';
logger.info('App starting...', app.getVersion());

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

    var dir = path.join(app.getPath('appData'), app.getName(), '/images');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
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
        autoUpdater.checkForUpdates();
    });


    // client.create(mainWindow, { sendBounds: true });
}

app.on('ready', createWindow)

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
})


function sendStatusToWindow(text) {
    logger.info(text);
    mainWindow.webContents.send('auto-update-message', text);
}

autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...');
})

autoUpdater.on('update-available', (ev, info) => {
    sendStatusToWindow('Update available.');
})

autoUpdater.on('update-not-available', (ev, info) => {
    sendStatusToWindow('Update not available.');
})

autoUpdater.on('error', (ev, err) => {
    sendStatusToWindow(`Error in auto-updater. ${err}`);
})

autoUpdater.on('download-progress', (ev, progressObj) => {
    sendStatusToWindow('Download progress...');
})

autoUpdater.on('update-downloaded', (ev, info) => {
    sendStatusToWindow('Update downloaded; will install in 5 seconds');
});



autoUpdater.on('update-downloaded', (ev, info) => {
    // Wait 5 seconds, then quit and install
    // In your application, you don't need to wait 5 seconds.
    // You could call autoUpdater.quitAndInstall(); immediately
    setTimeout(function () {
        autoUpdater.quitAndInstall();
    }, 5000)
})
