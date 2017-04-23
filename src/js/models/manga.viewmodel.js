import ko from "knockout";
import _ from "lodash";
import api from "js/common/api";
import "js/common/ko.custom-functions";
export default class Manga {
    constructor({
        mangaTitle,
        folderPath,
        isFavorite,
        thumbnail,
        pages,
        event,
        titleShort,
        scanlator,
        language,
        circle,
        resolution
    }) {
        // console.log("Manga::constructor", pages);
        this.mangaTitle = mangaTitle || "";
        this.folderPath = folderPath;
        this.isFavorite = ko.observable(isFavorite).toggleable();
        this.thumbnail = thumbnail || "http://placehold.it/200x288";
        this.pages = pages;
        this.pageImages = ko.observableArray([]);
        this.event = event;
        this.titleShort = titleShort;
        this.scanlator = scanlator;
        this.language = language;
        this.circle = circle;
        this.resolution = resolution;
    }

    toggleFolderOpen() {
        this.isOpen(!this.isOpen());
    }

    paddingLeft() {
        return `${5 + 20 * this.level}px`;
    }
}
