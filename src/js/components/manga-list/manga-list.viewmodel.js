import ko from "knockout";
import _ from "lodash";
import $ from "jquery";
import api from "js/common/api.js";
import template from "./manga-list.template.html";

const ipc = window.require('electron').ipcRenderer;

export class MangaListViewmodel {
    constructor(params) {
        this.subscriptions = [];
        this.mangas = ko.observableArray();
        this.selectedDirectory = params.selectedDirectory;
        this.bookmarks = params.bookmarks;
        this.searchValue = ko.observable("").extend({
            rateLimit: {
                timeout: 500,
                method: "notifyWhenChangesStop"
            }
        });
        this.searching = ko.observable(false).extend({rateLimit: 0});
        //computeds
        this.toggleBookmark = this.toggleBookmark.bind(this);
        this.selectedDirectoryText = ko.computed(this.selectedDirectoryText, this);
        this.isBookmarked = ko.computed(this.isBookmarked, this);
        this.includeSubfolders = ko.observable(false);
        this.searchOptions = ko.observableArray([
            {
                value : "current",
                text: "Current folder"
            },
            {
                value : "recursive",
                text: "Include Sub folders"
            }
        ]);
        this.searchOption = ko.observable(0);

        this.searchOption.subscribe(function (value) {
            console.log("searchOption changed", value);
        })
        this.initialize();
    }

    // methods
    initialize() {



        let comp = ko.computed(function function_name(argument) {
            let self = this;
            let value = this.searchValue().toLowerCase();
            let isRecursive = self.searchOption() === "recursive";
            self.searching(true);
            api.getMangaList(self.selectedDirectory().folderPath, isRecursive, value).then(function(data) {
                self.mangas(data.mangas);
                self.searching(false);
            });
        }, this).extend({rateLimit: 50});
        this.subscriptions.push(comp);
        this.selectedDirectory.valueHasMutated();
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.dispose());
        this.selectedDirectory = null;
        this.mangas([]);
    }

    selectedDirectoryText() {
        return this.selectedDirectory() ? `${this.selectedDirectory().folderName}` : "";
    }

    isBookmarked() {
        return this.selectedDirectory() ? this.selectedDirectory().isBookmarked() : false;
    }

    toggleBookmark() {
        if (this.selectedDirectory()) {
            let current = this.selectedDirectory();
            let isBookmarked = current.isBookmarked();
            let bookmarkPaths = _.map(this.bookmarks(), 'folderPath');
            current.isBookmarked(!isBookmarked);
            if (current.isBookmarked() && !_.includes(bookmarkPaths, current.folderPath)) {
                console.log("bookmarking");
                this.bookmarks.push(current);
            } else {
                console.log("unbookmarking", this.bookmarks());
                this.bookmarks.remove(function(folder) {
                    return folder.folderPath === current.folderPath;
                });
                console.log("unbookmarked", this.bookmarks());
            }

        }
    }
    static registerComponent() {
        ko.components.register("manga-list", {
            viewModel: MangaListViewmodel,
            template: template
        });
    }

    filteredManga() {
        let value = this.searchValue().toLowerCase();
        if (!value) {
            return this.mangas();
        } else {
            return _.filter(this.mangas(), function(manga) {
                let title = manga.mangaTitle;
                return _.includes(title.toLowerCase(), value);
            });
        }
    }
}
