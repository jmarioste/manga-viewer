const ipc = require('electron').ipcMain;
const path = require('path');
const fs = require('fs');

// import {ipcMain as ipc} from "electron";
// import path from "path";
// import fs from "fs";
exports.initializeGetSettingsEvents = function() {
    var saveFile = "save-file.json";
    ipc.on('read-settings', function(event) {
        let savePath = path.resolve(process.cwd(), saveFile);

        fs.readFile(savePath, "utf-8", function(err, data = "{}") {
            if (err) {
                console.log(err);
            }
            event.sender.send('read-settings-done', JSON.parse(data) || null);
        });
    });

    ipc.on('set-settings', function(event, settings) {
        let savePath = path.resolve(process.cwd(), saveFile);
        let data = JSON.stringify(settings, null, 4);
        fs.writeFile(savePath, data, "utf-8", function(err) {
            if (err) {
                console.log("error writing save file", err);
            }
            event.sender.send('set-settings-done', "done");
        });
    });
}