import { ipcRenderer as ipc } from "electron";
import { updateConfirmationDialog } from "renderer-process/components";
import { installConfirm } from "renderer-process/components";
import logger from "electron-log";
class AutoUpdater {
    constructor() {
    }

    checkForUpdates() {
        ipc.send('check-for-updates');
        ipc.once('update-available', function () {
            updateConfirmationDialog.show();
        });
    }

    downloadUpdates() {
        logger.info("downloading updates.");
        ipc.send("download-updates");
        ipc.once('update-downloaded', function () {
            logger.info("renderer:update-downloaded")
            installConfirm.show();
        })
    }

    installUpdates() {
        ipc.send('install-updates');
    }
}

export const autoUpdater = new AutoUpdater();