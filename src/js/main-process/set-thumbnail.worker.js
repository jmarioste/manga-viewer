module.exports = function(input, done) {
    const path = require('path');
    const _ = require('lodash');
    const Zip = require('adm-zip');
    const Promise = require('bluebird');

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
                    resolve(manga);
                }

                if (zip) {
                    //find first image as thumbnail.
                    let sorted = _.sortBy(zip.getEntries(), 'name');
                    let entry = sorted.find(function(entry) {
                        let imageRegex = /(\.jpg$|\.png$)/;
                        return imageRegex.test(path.extname(entry.name))
                    });

                    let extractTo = path.join(cwd, "thumbnail", mangaTitle);
                    zip.extractEntryTo(entry, extractTo, false, true);

                    MangaCache[mangaTitle] = manga;

                    manga.thumbnail = path.join(extractTo, entry.name);
                    manga.pages = sorted.length;

                }
            }

            resolve(manga);
        })
    };

    Promise.map(mangas, setThumbnail).then(function(mangas) {
        done({
            MangaCache,
            mangas
        });
    });
}
