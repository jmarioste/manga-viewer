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
    let MangaCache = {};
    threads.config.set({
        basepath: {
            node: __dirname
        }
    });

    let thread = spawn("./set-thumbnail.worker.js");
    let getPageThread = spawn("./get-manga-pages.worker.js");

    self.initializeEvents = function() {
        self.initializeGetSubFolder();
        self.initializeGetMangaList();
        self.initializeGetFavoritesList();
        self.initializeGetPages();
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

            self.getMangaCache().then(function(cache) {
                MangaCache = cache;
                return self.getFiles(rootFolder, searchValue, isRecursive);
            }).then(function(files) {
                let mangas = self.getMangas(files);
                thread.send({
                    mangas: mangas,
                    cache: MangaCache,
                    cwd: process.cwd()
                })
            });


            thread.once('message', function(response) {
                MangaCache = response.MangaCache;
                console.log("tread::on - message - manga-list", JSON.stringify(response.mangas, null, 4));
                event.sender.send('get-manga-list-done', response.mangas);
            });

        });
    }

    self.initializeGetFavoritesList = function() {
        ipc.on('get-favorites-list', function(event, folderPaths) {
            console.log('get-favorites-list::starting..');
            self.getMangaCache().then(function(cache) {
                MangaCache = cache;
                let mangas = self.getMangas(folderPaths);
                thread.send({
                    mangas: mangas,
                    cache: MangaCache,
                    cwd: process.cwd()
                })
            })


            thread.once('message', function(response) {
                MangaCache = response.MangaCache;
                console.log("tread::on - message - favorites-list");
                event.sender.send('get-favorites-list-done', response.mangas);
            });

        });
    }

    self.initializeGetPages = function() {
        ipc.on('get-pages', function(event, input) {
            console.log('get-pages::starting..');
            getPageThread.send(input)

            getPageThread.once('message', function(pages) {
                console.log("tread::on - message - get-pages");
                event.sender.send('get-pages-done', pages);
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
            let cacheKey = path.basename(filePath);
            let cached = MangaCache[cacheKey] || {};
            console.log('cached', cached.pages);
            return {
                mangaTitle: mangaTitle,
                folderPath: filePath,
                thumbnail: cached.thumbnail,
                pages: cached.pages
            }
        });
    }

    self.getMangaCache = function getMangaCache() {
        return new Promise(function(resolve, reject) {
            if (_.isEmpty(MangaCache)) {
                let mangaFile = path.join(process.cwd(), "manga-db.json");
                fs.readFile(mangaFile, "utf-8", function(err, data = "{}") {
                    if (err) {
                        console.log(err);
                        MangaCache = {}
                        resolve(MangaCache);
                    }
                    MangaCache = JSON.parse(data);
                    resolve(MangaCache);
                });
            } else {
                resolve(MangaCache);
            }
        });
    }


    self.saveMangaCache = function saveMangaCache() {
        let savePath = path.resolve(process.cwd(), "manga-db.json");
        let data = JSON.stringify(MangaCache, null, 4);
        console.log(data);
        return new Promise(function(resovle, reject) {
            console.log("get-mangalist::saveMangaCache - saving to ", savePath);
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
