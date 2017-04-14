import ko from "knockout";
import _ from "lodash";
import path from "path";

import api from "js/common/api.js";
import Folder from "js/models/folder.viewmodel.js";

export default class ViewModel {
    constructor(params) {
        params.bookmarks = _.without(params.bookmarks, null);
        let self = this;
        this.appTitle = ko.observable("Baiji Manga Viewer");
        // "G:/Users/Shizkun/"
        this.currentPage = ko.observable("manga-list-view");
        this.currentFolder = ko.observable(params.currentFolder);
        this.isInitialize = ko.observable(false);
        this.selectedDirectory = ko.observable();
        this.favorites = ko.observableArray(params.favorites);
        this.selectedManga = ko.observable(null);
        this.bookmarks = ko.observableArray(_.map(params.bookmarks, function(folderPath) {
            let folderName = path.basename(folderPath);
            return new Folder({
                folderName: folderName,
                folderPath: folderPath,
                isBookmarked: true
            });
        }));

        this.sub = ko.computed(function() {
            let currentFolder = this.currentFolder();
            let bookmarks = _.map(this.bookmarks(), 'folderPath');
            let favorites = this.favorites();
            api.writeSettings({
                currentFolder,
                bookmarks,
                favorites
            });
        }, this).extend({
            rateLimit: 500
        });

        this.selectedManga.subscribe(function(manga) {
            if (manga) {
                this.selectedDirectory(null);
            }
        }, this);
    }
}
