const path = require('path');
const fs = require('fs');
const ipc = require('electron').ipcMain;
const _ = require('lodash');
const recursive = require('recursive-readdir');

exports.initializeEvents = function() {
    ipc.on('get-subfolders', function(event, rootFolder) {
        fs.readdir(rootFolder, {}, function(err, files) {
            if (err) {
                console.log("get-mangalist::get-subfolders", err);
                return;
            }

            let folders = files.map(function(folderName) {
                let folderPath = path.resolve(rootFolder, folderName);
                let stat = fs.lstatSync(folderPath);
                if (stat.isDirectory()) {
                    return {
                        folderName,
                        folderPath
                    }
                }
            })

            folders = _.filter(folders, function(folder) {
                return !!folder;
            });
            event.sender.send('get-subfolders-done', folders);
        });
    });

    ipc.on('get-manga-list', function(event, data) {
        let rootFolder = data.rootFolder;
        let searchValue = data.searchValue || "";
        let isRecursive = data.isRecursive;
        let ignored = [];
        console.log("get-manga-list::", rootFolder, searchValue, "isRecursive", isRecursive);

        function isNotSearched(file, stats) {
            let isNotSearched = stats.isFile() && path.basename(file).toLowerCase().indexOf(searchValue) < 0;
            let isNotSupportedFileFormat = stats.isFile() && !/(\.rar$|\.zip$)/ig.test(path.extname(file))
            return isNotSearched || isNotSupportedFileFormat;
        }

        function isDirectory(file, stats) {
            return stats.isDirectory();
        }

        ignored = [isNotSearched];
        if (!isRecursive) {
            ignored.push(isDirectory);
        }
        recursive(rootFolder, ignored, function(err, files) {
            if (err) {
                console.log(err);
            }

            let manga = _(files).map(function(filePath) {
                mangaTitle = path.basename(filePath);
                return {
                    mangaTitle: mangaTitle,
                    folderPath: filePath
                }
            }).sortBy('mangaTitle').value();
            console.log(manga);
            event.sender.send('get-manga-list-done', manga)
        })
    });
};