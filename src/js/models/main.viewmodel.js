import ko from "knockout";
import _ from "lodash";
import path from "path";

import api from "js/common/api.js";
import Folder from "js/models/folder.viewmodel.js";
import {
    DefaultCommandHotkeys
} from "js/models/command.viewmodel";

export default class ViewModel {
    constructor(params) {
        params.bookmarks = _.without(params.bookmarks, null);
        let self = this;
        this.appTitle = ko.observable("Baiji Manga Viewer");
        // "G:/Users/Shizkun/"
        this.currentPage = ko.observable(params.currentPage || "manga-list-view");
        this.currentFolder = ko.observable(params.currentFolder);
        this.selectedDirectory = ko.observable();
        this.favorites = ko.observableArray(params.favorites);
        this.selectedManga = ko.observable();
        this.selectedMangaPath = ko.observable(params.selectedMangaPath);
        this.currentViewMangaPage = ko.observable(0);
        this.viewMangaCommand = ko.observable(null).extend({
            notify: 'always'
        });
        this.pagination = ko.observable(0);
        this.scrollEnd = ko.observable(false).extend({
            rateLimit: 500
        });
        this.appCommands = ko.observable(_.extend({}, DefaultCommandHotkeys, params.appCommands));
        this.bookmarks = ko.observableArray(_.map(params.bookmarks, function(folderPath) {
            let folderName = path.basename(folderPath);
            return new Folder({
                folderName: folderName,
                folderPath: folderPath,
                isBookmarked: true
            });
        }));
        this.searching = ko.observable(false);
        this.isRecursive = ko.observable(params.isRecursive);
        this.sub = ko.computed(function() {
            let currentFolder = this.currentFolder();
            let bookmarks = _.map(this.bookmarks(), 'folderPath');
            let favorites = this.favorites();
            let selectedMangaPath = this.selectedManga() ? this.selectedManga().folderPath : this.selectedMangaPath();
            let appCommands = _.extend({}, DefaultCommandHotkeys, this.appCommands());
            api.writeSettings({
                currentFolder,
                bookmarks,
                favorites,
                isRecursive: this.isRecursive(),
                currentPage: this.currentPage(),
                appCommands: appCommands,
                selectedMangaPath: selectedMangaPath

            });
        }, this).extend({
            rateLimit: 500
        });

        this.selectedManga.subscribe(function(manga) {
            if (manga) {
                this.selectedDirectory(null);
            }
        }, this);

        this.isRecursive.subscribe(function(value) {
            console.log("MainViewmodel::isRecursive changed", value);
        })
    }
}
