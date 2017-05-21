const { ipcMain } = require('electron');
const { autoUpdater } = require("electron-updater");
const logger = require('electron-log');
autoUpdater.logger = logger;
autoUpdater.logger.transports.file.level = 'info';
autoUpdater.autoDownload = false;
const UpdateEvents = {
    CheckingForUpdate: 'checking-for-update',
    UpdateAvailable: 'update-available',
    UpdateNotAvailable: 'update-not-available',
    UpdateError: 'error',
    DownloadProgress: 'download-progress',
    UpdateDownloaded: 'update-downloaded'
}

class MainProcessAutoUpdater {
    constructor(mainWindow) {
        this.mainWindow = mainWindow;
    };

    initialize() {
        var self = this;
        ipcMain.on('check-for-updates', function (event) {

            autoUpdater.checkForUpdates();
        });

        autoUpdater.on('checking-for-update', () => {
            this.sendStatusToWindow(UpdateEvents.CheckingForUpdate);
        })

        autoUpdater.on('update-available', (ev, info) => {
            this.sendStatusToWindow(UpdateEvents.UpdateAvailable);
        })

        autoUpdater.on('update-not-available', (ev, info) => {
            this.sendStatusToWindow(UpdateEvents.UpdateNotAvailable);
        })

        autoUpdater.on('error', (ev, err) => {
            this.sendStatusToWindow(Events.UpdateError, `Error in auto-updater. ${err}`);
        })

        autoUpdater.on('download-progress', (progress) => {
            logger.info(`speed ${progress.bytesPerSecond}/s, transferred ${progress.transferred} / ${progress.total}`)
            this.sendStatusToWindow(UpdateEvents.DownloadProgress, progress);
        })

        autoUpdater.on('update-downloaded', (ev, info) => {
            this.sendStatusToWindow(UpdateEvents.UpdateDownloaded);
        });

        ipcMain.on('download-updates', function () {
            autoUpdater.downloadUpdate();
        });

        ipcMain.on('install-updates', function () {
            setTimeout(function () {
                autoUpdater.quitAndInstall();
            }, 5000);
        })
    }

    sendStatusToWindow(event, obj) {
        logger.info(event);
        this.mainWindow.webContents.send(event, obj);
    }
}

module.exports = MainProcessAutoUpdater;