import ko from "knockout";

import { DefaultCommandHotkeys } from "renderer-process/models";

export class Settings {
    constructor(params) {
        this.isRecursive = ko.observable(params.isRecursive);
        this.currentFolder = ko.observable();
        this.favorites = ko.observableArray();
        this.selectedMangaPath = ko.observable();
        this.appCommands = ko.observableArray();


        this.onSettingsChanged = ko.pureComputed(this.onSettingsChanged, this);
        this.initialize();
    }

    initialize() {}

    onSettingsChanged() {

        let selectedMangaPath = this.selectedManga() ? this.selectedManga().folderPath : this.selectedMangaPath();
        return {
            currentFolder: this.currentFolder(),
            bookmarks: _.map(this.bookmarks(), 'folderPath'),
            favorites: this.favorites(),
            selectedMangaPath: selectedMangaPath,
            appCommands: _.extend({}, DefaultCommandHotkeys, this.appCommands()),
            isRecursive: this.isRecursive()
        }
    }
}
