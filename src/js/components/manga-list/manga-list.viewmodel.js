import ko from "knockout";
import _ from "lodash";
import $ from "jquery";

import api from "js/common/api.js";
import MangaFactory from "js/common/manga.factory.js";
import template from "./manga-list.template.html";

const ipc = window.require('electron').ipcRenderer;

export class MangaListViewmodel {
    constructor(params) {
        console.log("MangaListViewmodel::constructor - end");
        var self = this;
        this.subscriptions = [];


        this.selectedDirectory = params.selectedDirectory;
        this.bookmarks = params.bookmarks;
        this.favorites = params.favorites;
        this.isInitialize = params.isInitialize;
        this.currentPage = params.currentPage;
        this.selectedManga = params.selectedManga;

        this.searchValue = ko.observable("");
        this.mangas = ko.observableArray([]);
        this.searching = ko.observable(false);
        this.mangaFactory = new MangaFactory();

        //computed variables
        this.toggleBookmark = this.toggleBookmark.bind(this);
        this.toggleFavorites = this.toggleFavorites.bind(this);
        this.afterRender = this.afterRender.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.viewManga = this.viewManga.bind(this);
        this.selectedDirectoryText = ko.pureComputed(this.selectedDirectoryText, this);
        this.isBookmarked = ko.pureComputed(this.isBookmarked, this);

        this.searchOptions = ko.observableArray([{
            value: "non-recursive",
            text: "Current folder"
        }, {
            value: "recursive",
            text: "Include subfolders"
        }]);
        this.isRecursive = ko.observable("non-recursive").extend({
            rateLimit: 50
        });
        this.requesting = null;
        // this.initialize();

        this.initialize();
        console.log("MangaListViewmodel::constructor - end");
    }

    // methods
    initialize() {
        console.log("MangaListViewmodel::initialize - ");
        let computed = ko.computed(function function_name(argument) {
            let value = this.searchValue().toLowerCase();
            let selected = this.selectedDirectory();
            let isRecursive = this.isRecursive() == "recursive";
            if (!this.requesting && selected) {
                console.log("MangaListViewmodel::computed");
                let path = selected.folderPath;
                this.requesting = api.getMangaList(path, isRecursive, value);
                this.searching(true);
                this.requesting.then(data => {
                    let mangas = data.mangas.map((manga) => {
                        manga.isFavorite = _.includes(this.favorites(), manga.folderPath);
                        return this.mangaFactory.getManga(manga)
                    });
                    this.mangas(_.sortBy(mangas, 'mangaTitle'));
                    this.searching(false);
                    this.requesting = null;
                });
            }

        }, this).extend({
            rateLimit: 500
        });

        let sub = this.selectedDirectory.subscribe(function() {
            this.searchValue("");
        }, this);

        this.subscriptions.push(computed);
        this.subscriptions.push(sub);
    }

    dispose() {
        console.log("MangaListViewmodel::dispose")
        this.subscriptions.forEach(sub => sub.dispose());
    }

    clearSearch() {
        this.searchValue("");
    }

    afterRender(element, data) {
        if (_.last(this.mangas()) == data) {
            console.log("MangaListViewmodel::afterRender");
            this.isInitialize(true);
        }

    }
    selectedDirectoryText() {
        return this.selectedDirectory() ? this.selectedDirectory().folderName : "";
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

    toggleFavorites(manga) {
        manga.isFavorite(!manga.isFavorite());
        if (manga.isFavorite()) {
            if (!_.includes(manga.folderPath)) {
                this.favorites.push(manga.folderPath);
            }
        } else {
            this.favorites.remove(manga.folderPath);
        }
    }

    viewManga(manga) {
        this.selectedManga(manga);
        this.currentPage("view-manga-view");
    }

    static registerComponent() {
        ko.components.register("manga-list", {
            viewModel: MangaListViewmodel,
            template: template,
            synchronous: true
        });
    }
}

MangaListViewmodel.registerComponent();
