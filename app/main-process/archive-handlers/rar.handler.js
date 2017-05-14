const _ = require('lodash');
const Promise = require('bluebird');
const path = require('path');
// const sharp = require('sharp');
const myRegex = require('../../common/regex');
const Errors = require('../../common/errors');

// const APP_PATH = app.getAppPath();
// const RAR_EXE_PATH = path.join(APP_PATH, 'UnRAR.exe');

class RarHandler {
    constructor(manga, rarfile) {
        this.imagesFiles = [];
        this.manga = manga;
        this.rf = rarfile;
    }

    getPages(start, end) {
        return this.getImages()
            .then(images => images.filter(file => myRegex.SUPPORTED_IMAGES.test(file)).sort())
            .then(images => images.slice(start, end))
            .map(image => this.getBuffer(image))
            .map(buffer => this.getBase64(buffer));
    }

    getFilenames() {
        return new Promise((resolve, reject) => {
            this.rf._loadNames().then((filesStr) => {
                let files = filesStr.split(myRegex.NEXT_LINE);
                resolve(files);
            });
        });
    }

    getImages() {
        return this.getFilenames().then(files => {
            let images = files.filter(file => myRegex.SUPPORTED_IMAGES.test(file));

            if (images.length) {
                this.manga.pages = images.length;
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
                    reject(`RarMangaFile.setThumbnail - ${err}`);
                } else {
                    resolve(buffer);
                }
            });
        });
    }

    getBase64(buffer) {
        let str = buffer.toString('base64');
        return `data:image/bmp;base64,${str}`;
    }

    getThumbnailImage(sharp, writeStream, images) {
        return this.getThumbnailBuffer(images).then((buffer) => {
            let resize = sharp(buffer).resize(250, null).png();
            return new Promise((resolve, reject) => {
                resize.pipe(writeStream);
                writeStream.on('finish', resolve);
            });
        });
    }
}

module.exports = RarHandler;
