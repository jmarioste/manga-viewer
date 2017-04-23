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

    getManga(params) {
        if (!params.folderPath) {
            console.err("MangaFactory::getManga - folderPath is null");
            return;
        }

        let cached = cache[params.mangaTitle];

        if (_(cached).isNil()) {
            cache[params.mangaTitle] = new Manga(params);
        }
        return cache[params.mangaTitle];
    }
}
