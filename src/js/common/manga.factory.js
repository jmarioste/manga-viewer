import { Manga } from "js/models";
import api from "js/common/api";
let cache = {};

class MangaFactory {


    getManga(params) {
        let cached = cache[params.mangaTitle];
        if (!cached) {
            cached = new Manga(params);
            cache[params.mangaTitle] = cached;
        }
        return cached;
    }
}

export default new MangaFactory();
