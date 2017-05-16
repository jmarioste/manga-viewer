const Promise = require('bluebird');
const _ = require('lodash');
const Regex = require('../../common/regex');
const Errors = require('../../common/errors');
const toArray = require('stream-to-array');
const util = require('util');
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
                    resolve(zip);
                }
            })
        });
    }

    getImages() {
        let images = [];

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
                        resolve(images);
                    } else {
                        reject(new Error(`ZipHandler.getImages - ${Errors.NO_IMAGE_FILE}`));
                    }
                });

                zip.on("error", reject);
            });
        })

    }

    getReadStream(path) {
        return this.initialize().then((zip) => {
            return new Promise((resolve, reject) => {

                zip.readEntry();
                zip.on('entry', function (entry) {
                    if (path === entry.fileName) {
                        zip.openReadStream(entry, function (err, readStream) {
                            if (err) {
                                reject(new Error(`ZipHandler.getReadStream ${err}`))
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
                    reject(new Error(`ZipHandler.getReadStream ${error}`));
                })
            });
        })
    }

    getThumbnailImage(sharp, writeStream, images) {
        images = _.map(images, 'path').sort();
        return this.getReadStream([images[0]]).then((readStream) => {
            return new Promise((resolve, reject) => {
                let resizeStream = sharp().resize(250, null).png();
                readStream.pipe(resizeStream).pipe(writeStream);
                writeStream.on("finish", resolve);
            });
        })
    }

    getBufferFrom(readStream) {
        return toArray(readStream)
            .then(parts => parts.map(part => util.isBuffer(part) ? part : Buffer.from(part)))
            .then(buffers => Buffer.concat(buffers))
        // .then(function (parts) {
        //     const buffers = parts);
        //     return ;
        // })
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