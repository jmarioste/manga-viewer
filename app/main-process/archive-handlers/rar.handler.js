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
        return this.getAllImageFiles()
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

    getAllImageFiles() {
        return this.getFilenames().then(files => {
            let images = files.filter(file => myRegex.SUPPORTED_IMAGES.test(file));

            if (images.length) {
                return this.imagesFiles = images;
            } else {
                throw `RarMangaFile.getImageFiles ${Errors.NO_IMAGE_FILE}`;
            }
        })
    }

    getThumbnailBuffer(file) {
        return this.getAllImageFiles()
            .then((images) => _.first(images))
            .then(this.getBuffer);
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

    setThumbnailForManga(buffer, imagePath) {
        let dest = path.join(imagePath, `${this.manga._id}.png`);
        let writeStream = fs.createWriteStream(dest);
        let resize = sharp(buffer).resize(250, null).png();
        return new Promise((resolve, reject) => {
            resize.pipe(writeStream);
            writeStream.on('finish', () => {
                this.manga.thumbnail = dest;
                this.manga.pages = images.length;
                resolve(this.manga);
            });
        });
    }
}

module.exports = RarHandler;
