const path = require('path');
const fs = require('fs');
const ipc = require('electron').ipcMain;
const _ = require('lodash');

const Promise = require('bluebird');
const recursive = require('recursive-readdir');
const threads = require('threads');
const spawn = threads.spawn;



module.exports = (function() {
    let self = {};
    let imageCache = {};

    threads.config.set({
        basepath: {
            node: __dirname
        }
    });

    let thread = spawn("./set-thumbnail.worker.js");

    self.initializeEvents = function() {
        self.initializeGetSubFolder();
        self.initializeGetMangaList();
        self.initializeGetFavoritesList();
    }

    self.initializeGetSubFolder = function() {
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
    }

    self.initializeGetMangaList = function() {
        ipc.on('get-manga-list', function(event, data) {

            let rootFolder = data.rootFolder;
            let searchValue = data.searchValue;
            let isRecursive = data.isRecursive;
            let start = Date.now();

            self.getImageCache().then(function(cache) {
                imageCache = cache;
                return self.getFiles(rootFolder, searchValue, isRecursive);
            }).then(function(files) {
                let mangas = self.getMangas(files);
                thread.send({
                    mangas: mangas,
                    cache: imageCache,
                    cwd: process.cwd()
                })
            });


            thread.once('message', function(response) {
                imageCache = response.imageCache;
                console.log("tread::on - message - manga-list");
                event.sender.send('get-manga-list-done', response.mangas);
            });

        });
    }

    self.initializeGetFavoritesList = function() {
        ipc.on('get-favorites-list', function(event, folderPaths) {
            console.log('get-favorites-list::starting..');
            let mangas = self.getMangas(folderPaths);
            thread.send({
                mangas: mangas,
                cache: imageCache,
                cwd: process.cwd()
            })

            thread.once('message', function(response) {
                imageCache = response.imageCache;
                console.log("tread::on - message - favorites-list");
                event.sender.send('get-favorites-list-done', response.mangas);
            });

        });
    }

    self.getFiles = function getFiles(rootFolder, searchValue, isRecursive) {
        let ignored = [];
        console.log("getMangas", rootFolder, searchValue, isRecursive);

        function isNotSearched(file, stats) {
            let filePath = path.basename(file).toLowerCase();
            let isNotSearched = filePath.indexOf(searchValue) < 0;
            let zipRegex = /(\.zip$)/ig;
            let isNotSupportedFileFormat = stats.isFile() && !zipRegex.test(path.extname(file));
            return isNotSearched || isNotSupportedFileFormat;
        }

        function isDirectory(file, stats) {
            return stats.isDirectory();
        }

        ignored = [isNotSearched];
        if (!isRecursive) {
            ignored.push(isDirectory);
        }

        return new Promise(function(resolve, reject) {
            recursive(rootFolder, ignored, function(err, files) {
                if (err) {
                    console.log(err);
                }
                resolve(files);
            });
        })
    };

    self.getMangas = function getMangas(files) {
        files = _.slice(files, 0, 50);
        return files.map(function(filePath) {
            let mangaTitle = path.basename(filePath, ".zip");
            return {
                mangaTitle: mangaTitle,
                folderPath: filePath
            }
        });
    }

    self.getImageCache = function getImageCache() {
        return new Promise(function(resolve, reject) {
            if (_.isEmpty(imageCache)) {
                let thumbnailDb = path.join(process.cwd(), "thumbnails.json");
                fs.readFile(thumbnailDb, "utf-8", function(err, data = "{}") {
                    if (err) {
                        console.log(err);
                        imageCache = {}
                        resolve(imageCache);
                    }
                    imageCache = JSON.parse(data);
                    resolve(imageCache);
                });
            } else {
                resolve(imageCache);
            }
        });
    }

    self.saveImageCache = function saveImageCache() {
        let savePath = path.resolve(process.cwd(), "thumbnails.json");
        let data = JSON.stringify(imageCache, null, 4);
        return new Promise(function(resovle, reject) {
            console.log("get-mangalist::saveImageCache - saving to ", savePath);
            fs.writeFile(savePath, data, "utf-8", function(err, data) {
                if (err) {
                    console.log("error writing save file", err);
                    reject(err);
                }
                resolve();
            });
        });
    }
    return self;
})();
