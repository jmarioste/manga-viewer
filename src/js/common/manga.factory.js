import Manga from "js/models/manga.viewmodel";

let instance = null;
let cache = {};

export default class MangaFactory {

    constructor() {
        if (!instance) {
            instance = this;
        }

        return instance;
    }

    getManga({
        mangaTitle,
        folderPath,
        isFavorite
    }) {
        if (!folderPath) {
            console.err("MangaFactory::getManga - folderPath is null");
            return;
        }

        let cached = cache[folderPath];

        if (_(cached).isNil()) {
            console.log("MangaFactory::getManga - caching", mangaTitle);
            cache[folderPath] = new Manga({
                mangaTitle,
                folderPath,
                isFavorite
            });
        } else {
            console.info("MangaFactory::geManga - returning a cached instance for ", mangaTitle);
        }

        return cache[folderPath];
    }
}
