const path = require('path');
const fs = require('fs');
const ipc = require('electron').ipcMain;
const _ = require('lodash');

const Promise = require('bluebird');
const recursive = require('recursive-readdir');
const threads = require('threads');
const spawn = threads.spawn;

global.MangaCache = {};

module.exports = (function() {
    let self = {};
    threads.config.set({
        basepath: {
            node: __dirname
        }
    });

    let thread;
    let getPageThread = spawn("./get-manga-pages.worker.js");
    let favoritesThread;
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
        let processing = false;
        ipc.on('get-manga-list', function(event, data) {
            if (processing) {
                return;
            }
            processing = true;
            console.log("get-mangalist.js::ipc.on::get-manga-list");
            let rootFolder = data.rootFolder;
            let searchValue = data.searchValue;
            let isRecursive = data.isRecursive;
            let pagination = data.pagination;
            console.log("pagination", +pagination);

            thread = spawn("./set-thumbnail.worker.js");

            self.getMangaCache().then(function() {
                return self.getFiles(rootFolder, searchValue, isRecursive);
            }).then(function(files) {
                let mangas = self.getMangas(files) || [];
                let start = pagination * 50;
                let end = Math.min((pagination + 1) * 50, files.length);
                mangas = mangas.slice(start, end);
                thread.send({
                    mangas: mangas
                })
            });


            thread.on('progress', function(manga) {
                console.log("thread.on::progress");
                global.MangaCache[manga.mangaTitle] = manga;
                event.sender.send('get-manga-list-progress', manga);
            });
            thread.on('done', function() {
                // thread.disconnect();
                console.log("done");
                processing = false;
                thread.kill();
                event.sender.send('get-manga-list-done');
            })
        });
    }

    self.initializeGetFavoritesList = function() {
        let processing = false;
        ipc.on('get-favorites-list', function(event, folderPaths) {
            if (processing) {
                return;
            }
            processing = true;

            console.log('get-favorites-list::starting..');
            if (favoritesThread) {
                console.log("stopping thead");
                favoritesThread.kill();
                favoritesThread = spawn("./set-thumbnail.worker.js");
            } else {
                favoritesThread = spawn("./set-thumbnail.worker.js");
            }

            self.getMangaCache().then(function() {
                let mangas = self.getMangas(folderPaths);
                favoritesThread.send({
                    mangas: mangas
                })
            })


            favoritesThread.on('progress', function(manga) {
                console.log("favoritesThread.on::message");
                global.MangaCache[manga.mangaTitle] = manga;
                event.sender.send('get-favorites-list-progress', manga);
            });
            favoritesThread.on('done', function() {
                favoritesThread.kill();
                processing = false;
                console.log("done");
                event.sender.send('get-favorites-list-done');
            })

        });
    }

    self.initializeGetPages = function() {
        ipc.on('get-pages', function(event, input) {
            console.log('get-pages::starting..');
            getPageThread.send(input)

            getPageThread.once('message', function(pages) {
                console.log("tread::onmessage - get-pages");
                event.sender.send('get-pages-done', pages);
            });

        });
    }

    self.getFiles = function getFiles(rootFolder, searchValue, isRecursive) {
        let ignored = [];
        console.log("getFiles", rootFolder, searchValue, isRecursive);

        function isNotSearched(file, stats) {
            let filePath = path.basename(file).toLowerCase();
            let isNotSearched = stats.isFile() && filePath.indexOf(searchValue) < 0;
            let zipRegex = /(\.zip$)/ig;
            let isNotSupportedFileFormat = stats.isFile() &&
                !zipRegex.test(path.extname(file));
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
        let mangas = files.map(function(filePath) {
            let mangaTitle = path.basename(filePath, ".zip");
            let cacheKey = path.basename(filePath);
            let cached = global.MangaCache[mangaTitle] || {};
            let manga = {
                mangaTitle: mangaTitle,
                folderPath: filePath,
                thumbnail: cached.thumbnail,
                pages: cached.pages
            }
            self.parseInfo(manga);
            return manga;
        });
        return mangas;
    }

    self.parseInfo = function(manga) {
        let title = manga.mangaTitle.trim();
        //parse event
        let event = _.first(title.match(/^\(.*?\)/g));
        manga.event = event;

        //parse circle
        title = title.replace(event, "").trim();
        let circle = _.first(title.match(/^\[.*?\]/g));
        manga.circle = circle;

        //parse language & translator - Limitation only english language for now
        title = title.replace(circle, "").trim();
        let languageAndScanlator = _.first(title.match(/[\[\(]eng.*/gi)) || "";

        //set title        
        title = title.replace(languageAndScanlator, "").trim();
        manga.titleShort = title;

        //parse language
        let language = _.first(languageAndScanlator.match(/[\[\(]Eng.*?[\]\)]/g));
        manga.language = language;

        //parse resolution
        let scanlatorAndResolution = languageAndScanlator.replace(language, "").trim();
        let resolution = _.first(scanlatorAndResolution.match(/[-][0-9]+[x]/g));
        manga.resolution = resolution;

        //set scanlator
        manga.scanlator = scanlatorAndResolution.replace(resolution, "");
    }
    self.getMangaCache = function getMangaCache() {
        return new Promise(function(resolve, reject) {
            if (_.isEmpty(global.MangaCache)) {
                let mangaFile = path.join(process.cwd(), "manga-db.json");
                fs.readFile(mangaFile, "utf-8", function(err, data) {
                    if (err) {
                        console.log(err);
                        resolve();
                    } else {
                        global.MangaCache = JSON.parse(data || "{}");
                        resolve();
                    }

                });
            } else {
                resolve();
            }
        });
    }


    self.saveMangaCache = function saveMangaCache() {
        let savePath = path.resolve(process.cwd(), "manga-db.json");
        let data = JSON.stringify(global.MangaCache, null, 4);
        console.log("get-mangalist::saveMangaCache - saving to ", savePath);
        fs.writeFileSync(savePath, data, "utf-8");
        console.log("get-mangalist::saveMangaCache - done");
    }

    return self;
})();
