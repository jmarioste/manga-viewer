const Promise = require('bluebird');
const _ = require('lodash');
const Regex = require('../../common/regex');
const Errors = require('../../common/errors');


class ZipHandler {
    constructor(manga, yauzl) {
        this.manga = manga;
        this.yauzl = yauzl;
        this.yauzlOptions = {
            lazyEntries: true
        }
    }

    initialize() {
        let absolutePath = this.manga.folderPath;
        let options = this.yauzlOptions;
        return new Promise((resolve, reject) => {
            this.yauzl.open(absolutePath, options, (err, zip) => {
                if (err) {
                    reject(`ZipHandler.initalize ${err}`)
                } else {
                    resolve(zip);
                }
            })
        });
    }

    getImages() {
        let images = [];
        let manga = this.manga;
        return this.initialize().then((zip) => {
            return new Promise((resolve, reject) => {
                zip.readEntry();

                zip.on('entry', function (entry) {
                    let isImage = Regex.SUPPORTED_IMAGES.test(entry.fileName);
                    if (isImage && entry.uncompressedSize > 60000) {
                        images.push({
                            path: entry.fileName
                        });
                    }
                    zip.readEntry();
                })

                zip.on("end", function () {
                    zip.close();
                    if (images.length) {
                        manga.pages = images.length;
                        resolve(images);
                    } else {
                        reject(`ZipHandler.getImages - ${Errors.NO_IMAGE_FILE}`);
                    }
                });

                zip.on("error", function (error) {
                    reject(`ZipHandler.getImages - ${error}`);
                });
            });
        })

    }

    getReadStream(images) {
        return this.initialize().then((zip) => {
            return new Promise((resolve, reject) => {
                images = _.sortBy(images, 'path');
                zip.readEntry();
                zip.on('entry', function (entry) {
                    if (images[0].path === entry.fileName) {
                        zip.openReadStream(entry, function (err, readStream) {
                            if (err) {
                                reject(`ZipHandler.getReadStream ${err}`)
                            } else {
                                resolve(readStream);
                                zip.close();
                            }
                        });
                    } else {
                        zip.readEntry();
                    }
                });

                zip.on("error", function (error) {
                    reject(`ZipHandler.getReadStream ${error}`);
                })
            });
        })
    }

    getThumbnailImage(sharp, writeStream, images) {
        return this.getReadStream(images).then((readStream) => {
            return new Promise((resolve, reject) => {
                let resizeStream = sharp().resize(250, null).png();
                readStream.pipe(resizeStream).pipe(writeStream);
                writeStream.on("finish", resolve);
            });
        })
    }
}


module.exports = ZipHandler;