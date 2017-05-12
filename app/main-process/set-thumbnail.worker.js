//console.log("set-thumbnail.worker.js start");
const path = require('path');
const _ = require('lodash');
const yauzl = require('yauzl');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
const rarfile = require('rarfile');
//console.log("set-thumbnail.worker.js");
module.exports = function(input, done, progress) {
    //console.log("set-thumbnail.worker.js");
    let mangas = input.mangas;
    let dataPath = input.dataPath;
    let appPath = input.appPath;
    let yauzlOptions = {
        lazyEntries: true
    };
    let zipRegex = /zip$/ig;
    let rarRegex = /rar$/ig;

    function setThumbnail(manga) {
        //console.log("set-thumbnail.worker.js::setThumbnail")
        let filePath = manga.folderPath;

        return new Promise(function(resolve, reject) {
            let mangaTitle = path.basename(filePath);
            if (manga.thumbnail) {
                resolve(manga);
                progress(manga);
            } else {
                let ext = path.extname(filePath).toLowerCase();
                let isZip = ext.indexOf(".zip") >= 0;
                let isRar = ext.indexOf(".rar") >= 0;
                if (isZip) {
                    getImages(manga)
                        .then(extractThumbnail)
                        .then(function(manga) {
                            resolve(manga);
                            progress(manga);

                        }).catch(function(err) {
                            console.log("err - resolving", err);
                            resolve(); //do not include manga
                        });

                } else if (isRar) {
                    getThumbnailRar(manga).then(function(manga) {
                        //console.log("resolved", manga, manga.thumbnail, manga.pages);
                        resolve(manga);
                        progress(manga);
                    }).catch(function(err) {
                        console.log("isRar err - resolving", err);
                        resolve();
                    })
                } else {
                    console.log("inside else", manga.folderPath, isZip, isRar, path.extname(filePath));
                    resolve();
                }
            }

        })
    };

    function getThumbnailRar(manga) {
        console.log("set-thumbnail.worker.js::getThumbnailRar", manga.folderPath);
        return new Promise(function(resolve, reject) {
            let rf;
            try {
                //console.log(manga.folderPath, appPath);
                rf = new rarfile.RarFile(manga.folderPath, {
                    rarTool: path.join(appPath, "UnRAR.exe")
                });
                setTimeout(function() {
                    throw "timeout err";
                }, 1000);
            } catch (e) {
                console.log("getThumbnailRar error", manga.folderPath);
                reject("getThumbnailRar error", e);
                return;
            }

            rf._loadNames().then(function(names) {
                let files = names.split(/[\r\n]/ig);
                console.log(files);
                let imageRegex = /(\.jpg$|\.png$)/ig;
                let images = files.filter(file => imageRegex.test(file));
                let first = _.first(images);

                let dest = path.join(dataPath, "/images", manga._id + ".png");
                let writeStream = fs.createWriteStream(dest);

                if (first) {
                    //console.log("first", first);
                    rf.readFile(first, function(err, buffer) {
                        //console.log('dest', dest);
                        let resize = sharp(buffer).resize(250, null).png();
                        resize.pipe(writeStream);

                        writeStream.on('finish', function() {
                            manga.thumbnail = dest;
                            manga.pages = images.length;
                            //console.log(manga.titleShort, manga.pages);
                            resolve(manga);
                            //console.log("getThumbnailRar - finish");
                            rf = null;
                        })

                    });
                } else {
                    rf = null;
                    reject("getThumbnailRar error", manga.folderPath);
                }
            });

        })
    }

    function getImages(manga) {
        //console.log("getImages::", manga.titleShort);
        return new Promise(function(resolve, reject) {
            let images = [];

            yauzlOpen(manga.folderPath).then(function(zip) {
                zip.readEntry();
                //console.log("getImages::after readEntry");
                zip.on('entry', function(entry) {
                    //console.log("getImages::on entry");
                    let isImage = /(\.jpg$|\.png$)/i.test(entry.fileName);
                    if (isImage && entry.uncompressedSize > 60000) {
                        images.push({
                            path: entry.fileName
                        });
                    }
                    zip.readEntry();
                })

                zip.on("end", function() {
                    //console.log("zip.once::end");
                    zip.close();
                    if (images.length) {
                        resolve({
                            images: images,
                            manga: manga
                        });
                    } else {
                        console.log("getImages error", manga.folderPath)
                        reject("No images found in .zip file");
                    }
                });
                zip.on("error", function(error) {
                    //console.log("getImages::zip.on::error", error);
                    console.log("getImages error", manga.folderPath)
                    reject(error);
                });
            }).catch(function(err) {
                console.log("getImages error", manga.folderPath)
                reject(err);
            })
        })
    };

    function extractThumbnail(params) {
        //console.log("extractThumbnail::start");
        let {
            manga,
            images
        } = params;

        let resize = sharp().resize(250, null).png();
        let dest = path.join(dataPath, "/images", manga._id + ".png");
        let writeStream = fs.createWriteStream(dest);
        //console.log("extractThumbnail::after writeStream");
        return new Promise(function(resolve, reject) {
            yauzlOpen(manga.folderPath).then(function(zip) {
                images = _.sortBy(images, 'path');
                zip.readEntry();
                //console.log(images[0].path);
                zip.on('entry', function(entry) {
                    if (images[0].path === entry.fileName) {
                        zip.openReadStream(entry, function(err, readStream) {
                            if (err) {
                                console.log("extractThumbnail error", manga.folderPath)
                                reject(err)
                            } else {
                                readStream.pipe(resize).pipe(writeStream);
                                writeStream.on("finish", function() {
                                    manga.thumbnail = dest;
                                    manga.pages = images.length;
                                    resolve(manga);
                                    zip.close()
                                });
                            }
                        });
                    } else {
                        zip.readEntry();
                        //console.log("extractThumbnail::zip.readEntry");
                    }
                });
                zip.on("error", function(error) {
                    //console.log("extractThumbnail zip.on::error", error);
                    console.log("extractThumbnail error", manga.folderPath)
                    reject(error);
                })
            }).catch(function(err) {
                console.log("extractThumbnail error", manga.folderPath)
                reject(err);
            })
        })
    }

    function yauzlOpen(path) {
        //console.log("yauzlOpen");
        return new Promise(function(resolve, reject) {
            yauzl.open(path, yauzlOptions, function(err, zip) {
                //console.log("yauzlOpen::callback");
                if (err) {
                    console.log("yauzlOpen error", path)
                        //console.log("rejecting ", err);
                    reject(err);
                    // throw err;
                } else {
                    //console.log("yauzlOpen::resolving");
                    resolve(zip);
                }

            });
        });
    }

    Promise.each(mangas, setThumbnail).then(function(mangas) {
        console.log("set-thumbnail.worker.js::all promise done");
        done();
    }).catch(function(err) {
        //console.log("set-thumbnail.worker.js - fail");
        console.log(err);
        done();
    });
}
