const path = require('path');
const _ = require('lodash');
const Zip = require('adm-zip');
const Promise = require('bluebird');
const sharp = require('sharp');
3

module.exports = function(input, done, progress) {
    let mangas = input.mangas;
    //get
    function setThumbnail(manga) {
        let filePath = manga.folderPath;

        return new Promise(function(resolve, reject) {
            let mangaTitle = path.basename(filePath);
            // console.log(manga.titleShort, "hasThumbnail", !!manga.thumbnail);

            if (manga.thumbnail) {
                resolve(manga);
                progress(manga);
            } else {
                let zip = {};
                try {
                    zip = new Zip(filePath);
                } catch (e) {
                    console.log(e, filePath);
                    manga.thumbnail = "";
                    resolve(e);
                }

                if (zip) {
                    //find first image as thumbnail.
                    let sorted = _.sortBy(zip.getEntries(), 'name');
                    let entry = sorted.find(function(entry) {
                        let imageRegex = /(\.jpg$|\.png$)/ig;
                        let buffer = entry.getData();
                        return imageRegex.test(path.extname(entry.name)) && buffer.byteLength > 50000;
                    });
                    if (entry) {
                        let buffer = entry.getData();
                        // console.log("size", buffer.byteLength, filePath);
                        sharp(buffer)
                            .resize(250, null)
                            .png()
                            .toBuffer()
                            .then(function(data) {
                                let base64 = data.toString('base64');
                                manga.thumbnail = `data:image/png;base64, ${base64}`;
                                manga.pages = sorted.length;
                                resolve(manga);
                                progress(manga);
                            }).catch(function(e) {
                                console.log(e);
                                resolve(null);
                            });
                    } else {
                        console.log("no entry", mangaTitle);
                        resolve(manga);
                    }
                } else {
                    console.log("no zip", mangaTitle);
                    resolve(manga);
                }
            }


        })
    };

    Promise.each(mangas, setThumbnail).then(function(mangas) {

        console.log("set-thumbnail.worker.js::all promise done");
        done();
    }).catch(function(err) {
        console.log("set-thumbnail.worker.js - fail");
        console.log(err);
        done();
    });
}
