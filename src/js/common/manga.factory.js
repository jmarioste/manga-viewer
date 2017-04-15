import Manga from "js/models/manga.viewmodel";
import api from "js/common/api";
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
        isFavorite,
        thumbnail,
        pages
    }) {
        if (!folderPath) {
            console.err("MangaFactory::getManga - folderPath is null");
            return;
        }

        let cached = cache[mangaTitle];

        if (_(cached).isNil()) {
            console.log("MangaFactory::getManga - pages", pages);

            cache[mangaTitle] = new Manga({
                mangaTitle,
                folderPath,
                isFavorite,
                thumbnail,
                pages
            });
        } else {
            // console.info("MangaFactory::geManga - returning a cached instance for ", mangaTitle);
        }

        return cache[mangaTitle];
    }
}