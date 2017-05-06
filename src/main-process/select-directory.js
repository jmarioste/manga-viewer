import { ipcMain as ipc, dialog } from 'electron';

export default class SelectDirectory {
    constructor() {

    }
    initializeEvents(mainWindow) {
        ipc.on('select-directory', function(event) {

            dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory']
            }, function(folders) {
                if (folders) event.sender.send('select-directory-done', folders[0]);
            });
        })
    }
}
