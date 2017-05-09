const { ipcMain, dialog } = require('electron');

module.exports = (function(){
    function SelectDirectory() {

    }
    SelectDirectory.prototype.initializeEvents = function(mainWindow) {
        ipcMain.on('select-directory', function(event) {

            dialog.showOpenDialog(mainWindow, {
                properties: ['openDirectory']
            }, function(folders) {
                if (folders) event.sender.send('select-directory-done', folders[0]);
            });
        })
    }

    return SelectDirectory;
})();
