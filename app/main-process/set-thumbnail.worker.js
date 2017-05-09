console.log("set-thumbnail.worker.js start");
const path = require('path');
const _ = require('lodash');
const yauzl = require('yauzl');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
console.log("set-thumbnail.worker.js");
module.exports = function(input, done, progress) {
    console.log("set-thumbnail.worker.js");
    let mangas = input.mangas;
    let appPath = input.appPath;
    let yauzlOptions = {
        lazyEntries: true
    };

    function setThumbnail(manga) {
        console.log("set-thumbnail.worker.js::setThumbnail")
        let filePath = manga.folderPath;

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

                    }).catch(function(err) {
                        resolve(); //do not include manga
                    });
            }

        })
    };

    function getImages(manga) {
        console.log("getImages::", manga.titleShort);
        return new Promise(function(resolve, reject) {
            let images = [];

            yauzlOpen(manga.folderPath).then(function(zip) {
                zip.readEntry();
                console.log("getImages::after readEntry");
                zip.on('entry', function(entry) {
                    console.log("getImages::on entry");
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
                    if (images.length) {
                        resolve({
                            images: images,
                            manga: manga
                        });
                    } else {
                        reject("No images found in .zip file");
                    }
                });
                zip.on("error", function(error) {
                    console.log("getImages::zip.on::error", error);
                    reject(error);
                });
            }).catch(function(err) {
                reject(err);
            })
        })
    };

    function extractThumbnail(params) {
        console.log("extractThumbnail::start");
        let {
            manga,
            images
        } = params;

        let resize = sharp().resize(250, null).png();
        let dest = path.join(appPath, "/images", manga._id + ".png");
        let writeStream = fs.createWriteStream(dest);
        console.log("extractThumbnail::after writeStream");
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
                        console.log("extractThumbnail::zip.readEntry");
                    }
                });
                zip.on("error", function(error) {
                    console.log("extractThumbnail zip.on::error", error);
                    reject(error);
                })
            }).catch(function(err) {
                reject(err);
            })
        })
    }

    function yauzlOpen(path) {
        console.log("yauzlOpen");
        return new Promise(function(resolve, reject) {
            yauzl.open(path, yauzlOptions, function(err, zip) {
                console.log("yauzlOpen::callback");
                if (err) {

                    console.log("rejecting ", err);
                    reject(err);
                    // throw err;
                } else {
                    console.log("yauzlOpen::resolving");
                    resolve(zip);
                }

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
