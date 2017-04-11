import ko from "knockout";
import _ from "lodash";
import api from "js/common/api.js";
import "js/common/ko.custom-functions";
export default class Manga {
    constructor({
        mangaTitle,
        folderPath,
        isFavorite
    }) {

        this.mangaTitle = mangaTitle || "";
        this.folderPath = folderPath;
        this.isFavorite = ko.observable(isFavorite).toggleable();
    }

    toggleFolderOpen() {
        this.isOpen(!this.isOpen());
    }

    paddingLeft() {
        return `${5 + 20 * this.level}px`;
    }
}
