const ipc = require('electron').ipcMain;
const dialog = require('electron').dialog;

exports.initializeEvents = function (mainWindow) {
	ipc.on('select-directory', function(event) {

        dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        }, function(folders) {
            if (folders) event.sender.send('select-directory-done', folders[0]);
        });
    })
}
