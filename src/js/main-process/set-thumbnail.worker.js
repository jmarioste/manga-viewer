const path = require('path');
const _ = require('lodash');
const yauzl = require('yauzl');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
module.exports = function(input, done, progress) {
    let mangas = input.mangas;
    let appPath = input.appPath;
    let yauzlOptions = {
        lazyEntries: true
    };
    console.log("set-thumbnail.worker.js", appPath);

    function setThumbnail(manga) {
        let filePath = manga.folderPath;
        console.log("setThumbnail", manga.titleShort);
        return new Promise(function(resolve, reject) {
            let mangaTitle = path.basename(filePath);
            if (manga.thumbnail) {
                resolve(manga);
                progress(manga);
            } else {
                getImages(manga)
                    .then(extractThumbnail)
                    .then(function(manga) {
                        resolve(manga);
                        progress(manga);

                    });
            }

        })
    };

    function getImages(manga) {
        return new Promise(function(resolve, reject) {
            let images = [];

            yauzlOpen(manga.folderPath).then(function(zip) {
                zip.readEntry();
                zip.on('entry', function(entry) {
                    let isImage = /(\.jpg$|\.png$)/ig.test(entry.fileName);
                    if (isImage && entry.uncompressedSize > 60000) {
                        images.push({
                            path: entry.fileName
                        });
                    }
                    zip.readEntry();
                })

                zip.on("end", function() {
                    console.log("zip.once::end");
                    zip.close();
                    resolve({
                        images: images,
                        manga: manga
                    });
                });
            })
        })
    };

    function extractThumbnail(params) {
        let {
            manga,
            images
        } = params;

        let resize = sharp().resize(250, null).png();
        let dest = path.join(appPath, "/images", manga._id + ".png");
        let writeStream = fs.createWriteStream(dest);

        return new Promise(function(resolve, reject) {
            yauzlOpen(manga.folderPath).then(function(zip) {
                images = _.sortBy(images, 'path');
                zip.readEntry();
                zip.on('entry', function(entry) {
                    if (images[0].path === entry.fileName) {
                        zip.openReadStream(entry, function(err, readStream) {
                            if (err) throw err;

                            readStream.pipe(resize).pipe(writeStream);
                            writeStream.on("finish", function() {
                                manga.thumbnail = dest;
                                manga.pages = images.length;
                                resolve(manga);
                                zip.close()
                            });
                        });
                    } else {
                        zip.readEntry();
                    }
                });
            });
        })
    }

    function yauzlOpen(path) {
        return new Promise(function(resolve, rejec) {
            yauzl.open(path, yauzlOptions, function(err, zip) {
                if (err) throw err;
                resolve(zip);
            });
        });
    }
    Promise.each(mangas, setThumbnail).then(function(mangas) {
        console.log("set-thumbnail.worker.js::all promise done");
        done();
    }).catch(function(err) {
        console.log("set-thumbnail.worker.js - fail");
        console.log(err);
        done();
    });
}
