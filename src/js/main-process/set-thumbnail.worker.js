const path = require('path');
const _ = require('lodash');
const Zip = require('adm-zip');
const Promise = require('bluebird');
const sharp = require('sharp');
module.exports = function(input, done) {
    let MangaCache = input.cache;
    let mangas = input.mangas;
    let cwd = input.cwd;
    //get
    function setThumbnail(manga) {
        let filePath = manga.folderPath;
        return new Promise(function(resolve, reject) {
            let mangaTitle = path.basename(filePath);
            if (MangaCache[mangaTitle] && MangaCache[mangaTitle].thumbnail) {
                resolve(manga);
            } else {
                let zip = {};
                try {
                    zip = new Zip(filePath);
                } catch (e) {
                    console.log(e, filePath);
                    manga.thumbnail = "";
                    resolve(null);
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
                        console.log("size", buffer.byteLength);
                        sharp(buffer)
                            .resize(250, null)
                            .png()
                            .toBuffer()
                            .then(function(data) {
                                MangaCache[mangaTitle] = manga;
                                let base64 = data.toString('base64');
                                manga.thumbnail = `data:image/png;base64, ${base64}`;
                                manga.pages = sorted.length;
                                resolve(manga)
                            }).catch(function(e) {
                                console.log(e);
                                resolve(null);
                            });
                    } else {
                        resolve(null)
                    }


                }
            }


        })
    };

    Promise.each(mangas, setThumbnail).then(function(mangas) {

        mangas = _.filter(mangas, function(manga) {
            return !!manga.thumbnail;
        });

        // console.log(mangas);
        done({
            MangaCache,
            mangas
        });
    }, function(err) {
        console.log(err);
    });
}
