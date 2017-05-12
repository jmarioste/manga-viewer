const _ = require('lodash');
const Promise = require('bluebird');
const rarfile = require('rarfile');
const app = require('electron').app;
const path = require('path');
const sharp = require('sharp');
const myRegex = require('../../common/regex');
const Errors = require('../../common/errors');

const APP_PATH = app.getAppPath();
const RAR_EXE_PATH = path.join(APP_PATH, 'UnRAR.exe');

console.log("rar.handler.js");
class RarMangaFile {
    constructor(manga) {
        this.imagesFiles = [];
        this.manga = manga;
        console.log("RarMangaFile.contructor");
    }

    initialize() {
        return new Promise((resolve, reject) => {
            try {
                this.rf = new rarfile.RarFile(manga.folderPath, {
                    rarTool: RAR_EXE_PATH
                });
                setTimeout(() => { throw Errors.TIMEOUT_OPEN_RARFILE_ERR }, 1000);
            } catch (e) {
                reject(`RarMangaFile.initialize ${e}`);
            }
        });
    }

    getPages(start, end) {
        return this.getAllImageFiles()
            .then(images => images.filter(file => imageRegex.test(file)).sort())
            .then(images => _.slice(images, start, end))
            .map(image => getPagesRar(rf, image))
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
                this.imagesFiles = images;
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
            this.rf.readFile(first, (err, buffer) => {
                if (err) {
                    reject(`RarMangaFile.setThumbnail - ${err}`);
                } else {
                    resolve(buffer);
                }
            });
        });
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

module.exports = RarMangaFile;
