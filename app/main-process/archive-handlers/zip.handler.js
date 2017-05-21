const Promise = require('bluebird');
const _ = require('lodash');
const toArray = require('stream-to-array');
const util = require('util');
const logger = require('electron-log');
const Regex = require('../../common/regex');
const Errors = require('../../common/errors');

class ZipHandler {
    constructor(folderPath, yauzl) {
        this.folderPath = folderPath;
        this.yauzl = yauzl;
        this.yauzlOptions = {
            lazyEntries: true
        }
    }

    initialize() {
        let absolutePath = this.folderPath;
        let options = this.yauzlOptions;
        return new Promise((resolve, reject) => {
            this.yauzl.open(absolutePath, options, (err, zip) => {
                if (err) {
                    reject(new Error(`ZipHandler.initalize ${err}`))
                } else {
                    logger.debug(`ZipHandler.initialize - resolving`);
                    resolve(zip);
                }
            })
        });
    }

    getImages() {
        let images = [];
        let folderPath = this.folderPath;
        logger.debug(`ZipHandler.getImages starting...`);
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
                        logger.debug(`ZipHandler.getImages resolving`);
                        resolve(images);
                    } else {
                        reject(new Error(`${Errors.NO_IMAGE_FILE} - ${folderPath} `));
                    }
                });

                zip.on("error", reject);
            });
        })

    }

    getReadStream(path) {
        logger.debug(`ZipHandler.getReadStream`);
        return this.initialize().then((zip) => {
            return new Promise((resolve, reject) => {
                zip.readEntry();
                zip.on('entry', function (entry) {
                    if (path === entry.fileName) {
                        zip.openReadStream(entry, function (err, readStream) {
                            if (err) {
                                reject(new Error(`ZipHandler.getReadStream ${err}`))
                            } else {
                                logger.debug(`ZipHandler.getReadStream - resolving`);
                                resolve(readStream);
                                zip.close();
                            }
                        });
                    } else {
                        zip.readEntry();
                    }
                });

                zip.on("error", function (error) {
                    reject(new Error(`ZipHandler.getReadStream ${error}`));
                })
            });
        })
    }

    getThumbnailImage(sharp, writeStream, images) {
        images = _.map(images, 'path').sort();
        logger.debug(`ZipHandler.getThumbnailImage - starting`);
        let resizeHandler = sharp().resize(250).jpeg();
        return this.getReadStream(images[0]).then((readStream) => {
            return new Promise((resolve, reject) => {
                logger.debug("ZipHandler.getThumbnailImage - resizing and writing to file");
                readStream.pipe(resizeHandler).pipe(writeStream);
                writeStream.on("finish", function () {
                    resolve();
                });
            });
        })
    }

    getBufferFrom(readStream) {
        return toArray(readStream)
            .then(parts => parts.map(part => util.isBuffer(part) ? part : Buffer.from(part)))
            .then(buffers => Buffer.concat(buffers))
    }

    getPages(start, end) {
        return this.getImages()
            .then(images => _.map(images, 'path').sort())
            .then(paths => _.slice(paths, start, end))
            .map(path => this.getReadStream(path))
            .map(readStream => this.getBufferFrom(readStream))
            .map(buffer => buffer.toString('base64'))
            .map(str => `data:image/bmp;base64,${str}`)
    }
}


module.exports = ZipHandler;