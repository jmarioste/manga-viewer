//console.log("set-thumbnail.worker.js start");
const path = require('path');
const _ = require('lodash');
const yauzl = require('yauzl');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
const rarfile = require('rarfile');
const ZipHandler = require('./archive-handlers/zip.handler.js');
const RarHandler = require('./archive-handlers/rar.handler');
//console.log("set-thumbnail.worker.js");
module.exports = function (input, done, progress) {
    //console.log("set-thumbnail.worker.js");
    let mangas = input.mangas;
    let dataPath = input.dataPath;
    let appPath = input.appPath;
    let yauzlOptions = {
        lazyEntries: true
    };
    let zipRegex = /zip$/ig;
    let rarRegex = /rar$/ig;

    function setThumbnail(manga) {
        //console.log("set-thumbnail.worker.js::setThumbnail")
        let filePath = manga.folderPath;

        return new Promise(function (resolve, reject) {
            let mangaTitle = path.basename(filePath);
            if (manga.thumbnail) {
                resolve(manga);
                progress(manga);
            } else {
                let ext = path.extname(filePath).toLowerCase();
                let isZip = ext.indexOf(".zip") >= 0;
                let isRar = ext.indexOf(".rar") >= 0;
                let resize = sharp().resize(250, null).png();
                let dest = path.join(dataPath, "/images", manga._id + ".png");
                let writeStream = fs.createWriteStream(dest);
                manga.thumbnail = dest;
                if (isZip) {
                    let handler = new ZipHandler(manga, yauzl);
                    handler.initialize()
                        .then(handler.getImages)
                        .then((images) => {
                            manga.pages = images.length;

                            return handler.getThumbnailImage(images, resize, writeStream)
                        })
                        .then(() => {
                            resolve(manga);
                            progress(manga);
                        }).catch(function (err) {
                            console.log(`setThumnail - ${err}`);
                            resolve(); //do not include manga
                        });

                } else if (isRar) {
                    let rf = new rarfile.RarFile(manga.folderPath, {
                        rarTool: path.join(appPath, "UnRAR.exe")
                    });
                    let handler = new RarHandler(manga, rf)
                    handler.getAllImageFiles()
                        .then(images => handler.getThumbnailBuffer(images))
                        .then(buffer => handler.getThumbnailImage(buffer, sharp, writeStream))
                        .then(() => {
                            resolve(manga);
                            progress(manga);
                        }).catch(function (err) {
                            console.log(`setThumbnail - ${err}`);
                            resolve();
                        });
                } else {
                    console.log("inside else", manga.folderPath);
                    resolve();
                }
            }

        })
    };

    Promise.each(mangas, setThumbnail).then(function (mangas) {
        console.log("set-thumbnail.worker.js::all promise done");
        done();
    }).catch(function (err) {
        //console.log("set-thumbnail.worker.js - fail");
        console.log(err);
        done();
    });
}
