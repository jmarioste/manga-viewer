const path = require('path');
const fs = require('fs');
const ipc = require('electron').ipcMain;
const _ = require('lodash');
const DataStore = require('nedb');
const Promise = require('bluebird');
const recursive = require('recursive-readdir');
const threads = require('threads');
const spawn = threads.spawn;
const app = require('electron').app;

module.exports = (function() {
    let self = {};
    threads.config.set({
        basepath: {
            node: __dirname
        }
    });
    let db = new DataStore({
        filename: path.join(process.cwd(), "manga.db"),
        autoload: true
    });
    // db.ensureIndex({
    //     fieldName: 'folderPath'
    // })
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
            thread = spawn("./set-thumbnail.worker.js");
            self.getFiles(rootFolder, searchValue, isRecursive)
                .then(self.getMangas)
                .then(function(mangas) {
                    mangas = _.sortBy(mangas, 'titleShort');
                    console.log(mangas.length);
                    let start = pagination * 50;
                    let end = Math.min((pagination + 1) * 50, mangas.length);
                    mangas = mangas.slice(start, end);
                    thread.send({
                        mangas: mangas,
                        appPath: app.getAppPath()
                    })
                });


            thread.on('progress', function(manga) {
                console.log("thread.on::progress");
                if (!manga._id) {
                    db.insert(manga, function(err, doc) {
                        event.sender.send('get-manga-list-progress', doc);
                    });

                } else {
                    db.update({
                        _id: manga._id
                    }, manga, {}, function(err, doc) {
                        event.sender.send('get-manga-list-progress', manga);
                    })
                }

            });
            thread.on('done', function() {
                // thread.disconnect();
                console.log("done");
                processing = false;
                thread.kill();
                event.sender.send('get-manga-list-done');
            });
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
            self.getMangas(folderPaths).then(function(mangas) {
                favoritesThread.send({
                    mangas: mangas
                })
            });

            favoritesThread.on('progress', function(manga) {
                console.log("favoritesThread.on::message");
                db.find({
                    folderPath: manga.folderPath
                }, function(err, docs) {
                    // console.log(docs);
                    if (!docs.length) {
                        db.insert(manga);
                    }
                });
                event.sender.send('get-favorites-list-progress', manga);
            });
            favoritesThread.on('done', function() {
                favoritesThread.kill();
                processing = false;
                console.log("done");
                event.sender.send('get-favorites-list-done');
            })

        });

        ipc.on('get-manga', function(event, folderPath) {
            console.log('get-manga::starting..');
            favoritesThread = spawn("./set-thumbnail.worker.js");

            self.getMangas([folderPath]).then(function(mangas) {
                favoritesThread.send({
                    mangas: mangas
                })
            });

            favoritesThread.on('progress', function(manga) {
                console.log("get-manga.on::message");
                db.find({
                    folderPath: manga.folderPath
                }, function(err, docs) {
                    // console.log(docs);
                    if (!docs.length) {
                        db.insert(manga);
                    }
                });
                event.sender.send('get-manga-progress', manga);
            });

            favoritesThread.on('done', function() {
                favoritesThread.kill();
                processing = false;
                console.log("done");
                event.sender.send('get-manga-done');
            });

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
        return Promise.map(files, function(filePath) {
            return new Promise(function(resolve, reject) {
                let mangaTitle = path.basename(filePath, ".zip");
                db.findOne({
                    folderPath: filePath
                }, function(err, manga) {
                    if (!manga) {
                        manga = {
                            mangaTitle: mangaTitle,
                            folderPath: filePath,
                            path: path.dirname(filePath)
                        }
                        self.parseInfo(manga);
                        db.insert(manga, function(err, doc) {
                            resolve(doc);
                        })
                    } else {
                        resolve(manga);
                    }
                });
            })
        });
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

    return self;
})();
