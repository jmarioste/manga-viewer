module.exports = function(input, done) {
    const path = require('path');
    const _ = require('lodash');
    const Zip = require('adm-zip');
    const Promise = require('bluebird');

    let imageCache = input.cache;
    let mangas = input.mangas;
    let cwd = input.cwd;

    function setThumbnail(manga) {
        let filePath = manga.folderPath;
        return new Promise(function(resolve, reject) {
            let mangaTitle = path.basename(filePath);
            if (imageCache[mangaTitle]) {
                manga.thumbnail = imageCache[mangaTitle];
            } else {
                let zip = {};
                try {
                    zip = new Zip(filePath);
                } catch (e) {
                    console.log(e, filePath);
                    manga.thumbnail = "";
                    resolve(manga);
                }

                if (zip) {
                    //find first image as thumbnail.
                    let sorted = _(zip.getEntries()).sortBy('name');
                    let entry = sorted.find(function(entry) {
                        let imageRegex = /(\.jpg$|\.png$)/;
                        return imageRegex.test(path.extname(entry.name))
                    });
                    let extractTo = path.join(cwd, "thumbnail", mangaTitle);
                    zip.extractEntryTo(entry, extractTo, false, true);
                    imageCache[mangaTitle] = path.join(extractTo, entry.name);
                    manga.thumbnail = imageCache[mangaTitle];
                }
            }

            resolve(manga);
        })
    };

    Promise.map(mangas, setThumbnail).then(function(mangas) {
        done({
            imageCache: imageCache,
            mangas: mangas
        });
    });
}
