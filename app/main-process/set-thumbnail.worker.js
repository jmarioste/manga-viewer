
const path = require('path');
const _ = require('lodash');
const yauzl = require('yauzl');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
const rarfile = require('rarfile');
const ZipHandler = require('./archive-handlers/zip.handler.js');
const RarHandler = require('./archive-handlers/rar.handler');
const myRegex = require('../common/regex');
const Errors = require('../common/errors');
const logger = require('electron-log');
class SetThumnailWorker {
    constructor() {

    }

    getHandler(folderPath, appPath) {
        let isZip = myRegex.ZIP_FILE.test(folderPath);
        if (isZip) {
            resolve(new ZipHandler(folderPath, yauzl));
        } else {
            try {
                let rf = new rarfile.RarFile(folderPath, {
                    rarTool: path.join(appPath, "UnRAR.exe")
                });
                setTimeout(function () {
                    throw new Error('Errors.TIMEOUT_OPEN_RARFILE_ERR');
                }, 1000);
                logger.debug("rf", rf);
                return new RarHandler(folderPath, rf);
            } catch (error) {
                return new Error(`SetThumbnailWorker.getHandler ${error}`);
            }
        }

    }
    setThumbnail(manga, dataPath, appPath) {
        logger.debug("inside setThumbnail");
        return new Promise((resolve, reject) => {

            if (manga.thumbnail) {
                logger.debug("manga has thumbnail");
                resolve(manga);
            } else {
                logger.debug("manga has no thumbnail", manga.folderPath);
                manga.thumbnail = path.join(dataPath, "/images", manga._id + ".png");
                let writeStream = fs.createWriteStream(manga.thumbnail);
                let handler;
                this.getHandler(manga.folderPath, appPath)
                    .then(_handler => {
                        handler = _handler
                        logger.debug("got handler");
                        return handler.getImages()
                    })
                    .then(images => {
                        manga.pages = images.length;
                        logger.debug("got images", images.length);
                        return handler.getThumbnailImage(sharp, writeStream, images)
                    })
                    .then(() => {
                        logger.debug("resolving")
                        resolve(manga)
                    })
                    .catch(function (error) {
                        logger.error("error catch", error);
                        reject(error);
                    });
            }

        })
    };

    getImages(manga, appPath) {
        console.log("inside setThumbnail");
        return new Promise((resolve, reject) => {

            if (manga.thumbnail) {
                logger.debug("setThumbnail.getImages manga has thumbnail");
                resolve(manga);
            } else {
                logger.debug("setThumbnail.getImages manga has no thumbnail");
                this.getHandler(manga.folderPath, appPath)
                    .then(handler => handler.getImages())
                    .then(images => {
                        manga.pages = images.length
                        return manga;
                    })
                    .then(resolve)
                    .catch(reject);
            }

        })
    };
    getPages(folderPath, start, end, appPath) {
        return this.getHandler(folderPath, appPath)
            .then(handler => handler.getPages(start, end))
    }
}

module.exports = new SetThumnailWorker();