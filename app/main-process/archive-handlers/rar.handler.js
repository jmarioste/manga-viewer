const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');
// const sharp = require('sharp');
const myRegex = require('../../common/regex');
const Errors = require('../../common/errors');
const logger = require('electron-log');
// const APP_PATH = app.getAppPath();
// const RAR_EXE_PATH = path.join(APP_PATH, 'UnRAR.exe');

class RarHandler {
    constructor(folderPath, rarfile) {
        this.imagesFiles = [];
        this.folderPath = folderPath;
        this.rf = rarfile;
    }

    getPages(start, end) {
        return this.getImages()
            .then(images => images.filter(file => myRegex.SUPPORTED_IMAGES.test(file)).sort())
            .then(images => images.slice(start, end))
            .map(image => this.getBuffer(image))
            .map(buffer => this.getBase64(buffer))

    }

    getFilenames() {
        return new Promise((resolve, reject) => {
            this.rf._loadNames().then((filesStr) => {
                let files = filesStr.split(myRegex.NEXT_LINE);
                logger.debug(`RarHandler.getFilenames resolving`);
                resolve(files);
            });
        });
    }

    getImages() {
        return this.getFilenames().timeout(1000, new Error(Errors.TIMEOUT_OPEN_RARFILE_ERR)).then(files => {
            let images = files.filter(file => myRegex.SUPPORTED_IMAGES.test(file));

            if (images.length) {
                logger.debug(`RarHandler.getImages resolving ${this.folderPath} ${images}`);
                return this.imagesFiles = images;
            } else {
                throw `RarMangaFile.getImageFiles ${Errors.NO_IMAGE_FILE}`;
            }
        })
    }

    getThumbnailBuffer(images) {
        let image = _.first(images)
        return this.getBuffer(image);
    }

    getBuffer(file) {
        return new Promise((resolve, reject) => {
            this.rf.readFile(file, (err, buffer) => {
                if (err) {
                    logger.debug(`RarHandler.getBuffer error ${err.message}`);
                    reject(err);
                } else {
                    logger.debug(`RarHandler.getBuffer resolving`);
                    resolve(buffer);
                }
            });
        });
    }

    getBase64(buffer) {
        let str = buffer.toString('base64');
        logger.debug(`RarHandler.getBase64 returning`);
        return `data:image/bmp;base64,${str}`;
    }

    getThumbnailImage(sharp, writeStream, images) {
        return this.getThumbnailBuffer(images).timeout(1000, new Error(Errors.TIMEOUT_OPEN_RARFILE_ERR)).then((buffer) => {
            let resize = sharp(buffer).resize(250, null).png();
            return new Promise((resolve, reject) => {
                resize.pipe(writeStream);
                writeStream.on('finish', () => {
                    logger.debug(`RarHandler.getThumbnailImage  resolving`);
                    resolve();
                });
            });
        });
    }
}

module.exports = RarHandler;
