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
        pages
    }) {
        console.log("Manga::constructor", pages);
        this.mangaTitle = mangaTitle || "";
        this.folderPath = folderPath;
        this.isFavorite = ko.observable(isFavorite).toggleable();
        this.thumbnail = thumbnail || "http://placehold.it/200x288";
        this.pages = pages;
        this.pageImages = ko.observableArray([thumbnail]);
        this.parseOtherInfo();
    }
    parseOtherInfo() {
        let title = this.mangaTitle.trim();
        //parse event
        let event = _.first(title.match(/^\(.*?\)/g));
        this.event = event;

        //parse circle
        title = title.replace(event, "").trim();
        let circle = _.first(title.match(/^\[.*?\]/g));
        this.circle = circle;

        //parse language & translator - Limitation only english language for now
        title = title.replace(circle, "").trim();
        let languageAndScanlator = _.first(title.match(/[\[\(]eng.*/gi)) || "";

        //set title        
        title = title.replace(languageAndScanlator, "").trim();
        this.titleShort = title;

        //parse language
        let language = _.first(languageAndScanlator.match(/[\[\(]Eng.*?[\]\)]/g));
        this.language = language;

        //parse resolution
        let scanlatorAndResolution = languageAndScanlator.replace(language, "").trim();
        let resolution = _.first(scanlatorAndResolution.match(/[-][0-9]+[x]/g));
        this.resolution = resolution;

        //set scanlator
        this.scanlator = scanlatorAndResolution.replace(resolution, "");

    }
    toggleFolderOpen() {
        this.isOpen(!this.isOpen());
    }

    paddingLeft() {
        return `${5 + 20 * this.level}px`;
    }
}
