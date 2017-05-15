
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

class SetThumnailWorker {
    constructor() {

    }

    getHandler(manga, appPath) {
        return new Promise((resolve, reject) => {
            let isZip = myRegex.ZIP_FILE.test(manga.folderPath);
            if (isZip) {
                resolve(new ZipHandler(manga, yauzl));
            } else {
                try {
                    setTimeout(function () {
                        reject(Errors.TIMEOUT_OPEN_RARFILE_ERR);
                    }, 1000);

                    let rf = new rarfile.RarFile(manga.folderPath, {
                        rarTool: path.join(appPath, "UnRAR.exe")
                    });

                    resolve(new RarHandler(manga, rf));
                } catch (error) {
                    reject(`SetThumbnailWorker.getHandler ${error}`);
                }

            }
        });

    }
    setThumbnail(manga, dataPath, appPath) {

        return new Promise((resolve, reject) => {

            if (manga.thumbnail) {
                resolve(manga);
            } else {
                manga.thumbnail = path.join(dataPath, "/images", manga._id + ".png");
                let writeStream = fs.createWriteStream(manga.thumbnail);
                let handler;
                this.getHandler(manga, appPath)
                    .then(_handler => {
                        handler = _handler
                        return handler.getImages()
                    })
                    .then(images => handler.getThumbnailImage(sharp, writeStream, images))
                    .then(() => resolve(manga))
                    .catch(function (error) {
                        reject(error);
                    });
            }

        })
    };

}

module.exports = new SetThumnailWorker();