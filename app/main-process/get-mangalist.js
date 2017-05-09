const path = require ('path');
const fs = require ('fs');
const _ = require ('lodash');
const DataStore = require ('nedb');
const Promise = require ('bluebird');
const recursive = require ('recursive-readdir');
const threads = require('threads');
const { ipcMain, app } = require ('electron');

const ipc = ipcMain;

let spawn = threads.spawn;
threads.config.set({
    basepath: {
        node: __dirname
    }
});


module.exports = (function() {
    function GetMangaList() {
        console.log("--dirname", path.join(__dirname, "/main-process/"));

        this.db = new DataStore({
            filename: path.join(app.getPath('appData'), app.getName(), "manga.db"),
            autoload: true
        });

        this.getPageThread = spawn("get-manga-pages.worker.js");
        this.favoritesThread;

        this.getMangas = this.getMangas.bind(this);
        this.getFiles = this.getFiles.bind(this);
        this.parseInfo = this.parseInfo.bind(this);
    }

    GetMangaList.prototype.initialize = function() {
        this.initializeGetSubFolder();
        this.initializeGetMangaList();
        this.initializeGetFavoritesList();
        this.initializeGetPages();
    }

    GetMangaList.prototype.initializeGetSubFolder = function() {
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

    GetMangaList.prototype.initializeGetMangaList = function() {
        let processing = false;
        let self = this;
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
            let thread = spawn('set-thumbnail.worker.js');
            self.getFiles(rootFolder, searchValue, isRecursive)
                .then(self.getMangas)
                .then(function(mangas) {
                    mangas = _.sortBy(mangas, 'titleShort');
                    console.log(mangas.length);
                    let start = pagination * 50;
                    let end = Math.min((pagination + 1) * 50, mangas.length);
                    mangas = mangas.slice(start, end);

                    thread.send({
                        mangas:mangas,
                        appPath: path.join(app.getPath('appData'), app.getName())
                    })
                });


            thread.on('progress', function(manga) {
                console.log("self.thread.on::progress");
                if (!manga._id) {
                    self.db.insert(manga, function(err, doc) {
                        event.sender.send('get-manga-list-progress', doc);
                    });

                } else {
                    self.db.update({
                        _id: manga._id
                    }, manga, {}, function(err, doc) {
                        event.sender.send('get-manga-list-progress', manga);
                    })
                }

            });
            thread.on('done', function() {
                // self.thread.disconnect();
                console.log("done");
                processing = false;
                thread.kill();
                event.sender.send('get-manga-list-done');
            });
        });
    }

    GetMangaList.prototype.initializeGetFavoritesList = function() {
        let processing = false;
        let self = this;
        ipc.on('get-favorites-list', function(event, folderPaths) {
            if (processing) {
                return;
            }
            processing = true;

            console.log('get-favorites-list::starting..');
            if (self.favoritesThread) {
                console.log("stopping thead");
                self.favoritesThread.kill();
                self.favoritesThread = spawn("set-thumbnail.worker.js");
            } else {
                self.favoritesThread = spawn("set-thumbnail.worker.js");
            }
            self.getMangas(folderPaths).then(function(mangas) {
                self.favoritesThread.send({
                    mangas: mangas
                })
            });

            self.favoritesThread.on('progress', function(manga) {
                console.log("self.favoritesThread.on::message");
                self.db.find({
                    folderPath: manga.folderPath
                }, function(err, docs) {
                    // console.log(docs);
                    if (!docs.length) {
                        self.db.insert(manga);
                    }
                });
                event.sender.send('get-favorites-list-progress', manga);
            });
            self.favoritesThread.on('done', function() {
                self.favoritesThread.kill();
                processing = false;
                console.log("done");
                event.sender.send('get-favorites-list-done');
            })

        });

        ipc.on('get-manga', function(event, folderPath) {
            console.log('get-manga::starting..');
            self.favoritesThread = spawn("set-thumbnail.worker.js");

            self.getMangas([folderPath]).then(function(mangas) {
                self.favoritesThread.send({
                    mangas: mangas
                })
            });

            self.favoritesThread.on('progress', function(manga) {
                console.log("get-manga.on::message");
                self.db.find({
                    folderPath: manga.folderPath
                }, function(err, docs) {
                    // console.log(docs);
                    if (!docs.length) {
                        self.db.insert(manga);
                    }
                });
                event.sender.send('get-manga-progress', manga);
            });

            self.favoritesThread.on('done', function() {
                self.favoritesThread.kill();
                processing = false;
                console.log("done");
                event.sender.send('get-manga-done');
            });

        });
    }

    GetMangaList.prototype.initializeGetPages = function() {
        var self = this;
        ipc.on('get-pages', function(event, input) {
            console.log('get-pages::starting..');
            self.getPageThread.send(input)

            self.getPageThread.once('message', function(pages) {
                console.log("tread::onmessage - get-pages");
                event.sender.send('get-pages-done', pages);
            });

        });
    }

    GetMangaList.prototype.getFiles = function(rootFolder, searchValue, isRecursive) {
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

    GetMangaList.prototype.getMangas = function(files) {
        let self = this;
        return Promise.map(files, function(filePath) {
            return new Promise(function(resolve, reject) {
                let mangaTitle = path.basename(filePath, ".zip");
                self.db.findOne({
                    folderPath: filePath
                }, function(err, manga) {
                    if (!manga) {
                        manga = {
                            mangaTitle: mangaTitle,
                            folderPath: filePath,
                            path: path.dirname(filePath)
                        }
                        self.parseInfo(manga);
                        self.db.insert(manga, function(err, doc) {
                            resolve(doc);
                        })
                    } else {
                        resolve(manga);
                    }
                });
            })
        });
    }

    GetMangaList.prototype.parseInfo = function(manga) {
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

    return GetMangaList;
})();
