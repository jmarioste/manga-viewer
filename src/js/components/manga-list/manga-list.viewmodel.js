import ko from "knockout";
import _ from "lodash";
import $ from "jquery";
import Ps from "perfect-scrollbar";
import api from "js/common/api.js";
import MangaFactory from "js/common/manga.factory.js";
import template from "./manga-list.template.html";
import Command from "js/models/command.viewmodel";
const ipc = window.require('electron').ipcRenderer;

export class MangaListViewmodel {
    constructor(params) {
        console.log("MangaListViewmodel::constructor - end");
        var self = this;
        this.subscriptions = [];

        //params
        this.selectedDirectory = params.selectedDirectory;
        this.bookmarks = params.bookmarks;
        this.favorites = params.favorites;
        this.currentPage = params.currentPage;
        this.selectedManga = params.selectedManga;
        this.pagination = params.pagination;
        this.scrollEnd = params.scrollEnd;
        this.searching = params.searching;
        this.appCommands = params.appCommands;


        this.isRecursive = ko.observable(params.isRecursive());
        this.searchValue = ko.observable("");
        this.isSearchFocused = ko.observable(false);
        this.mangas = ko.observableArray([]);

        this.mangaFactory = new MangaFactory();
        this.showGuide = ko.observable();
        this.totalMangaSearched = ko.observable(0);
        //computed variables
        this.toggleBookmark = this.toggleBookmark.bind(this);
        this.toggleFavorites = this.toggleFavorites.bind(this);
        this.afterRender = this.afterRender.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.viewManga = this.viewManga.bind(this);
        this.focusSearch = this.focusSearch.bind(this);

        this.selectedDirectoryText = ko.pureComputed(this.selectedDirectoryText, this);

        this.isBookmarked = ko.pureComputed(this.isBookmarked, this);


        this.isRecursiveText = ko.pureComputed(function() {
            return this.isRecursive() ? "On" : "Off";
        }, this);
        this.requesting = null;

        this.initialize();
        this.commands = [
            new Command(this.appCommands().BOOKMARK_FOLDER, this.toggleBookmark),
            new Command(this.appCommands().FOCUS_SEARCH, this.focusSearch)
        ];
        console.log("MangaListViewmodel::constructor - end");
    }

    // methods
    initialize() {
        var self = this;
        console.log("MangaListViewmodel::initialize - ");
        let computed = ko.computed(function function_name(argument) {
            let value = this.searchValue().toLowerCase();
            let selected = this.selectedDirectory();
            let isRecursive = this.isRecursive();
            if (!this.requesting && selected) {
                console.log("MangaListViewmodel::computed");
                let path = selected.folderPath;
                api.getMangaList(path, isRecursive, value, 0);
                this.requesting = true;
                this.searching(true);
                this.mangas([]);
                this.pagination(0);
            }

        }, this).extend({
            rateLimit: 500
        });

        let sub = this.selectedDirectory.subscribe(function() {
            this.searchValue("");
        }, this);

        let sub3 = this.scrollEnd.subscribe(function(scrollEnd) {
            console.log("scrollEnd", scrollEnd);
            if (scrollEnd && !this.requesting) {
                this.pagination(this.pagination() + 1);
            }
        }, this);
        let sub2 = this.pagination.subscribe(function(pagination) {
            console.log("pagination updated");
            let value = this.searchValue().toLowerCase();
            let selected = this.selectedDirectory();
            let isRecursive = this.isRecursive();

            if (!this.requesting && selected) {
                console.log("MangaListViewmodel::pagination changed", pagination);
                let path = selected.folderPath;
                api.getMangaList(path, isRecursive, value, pagination);
                this.requesting = true;
                this.searching(true);
                this.scrollEnd(false);
            }
        }, this);

        ipc.on('get-manga-list-progress', function(event, manga) {
            if (manga) {
                manga.isFavorite = _.includes(self.favorites(), manga.folderPath);
                manga = self.mangaFactory.getManga(manga);
                self.mangas.push(manga);

                // self.mangas.valueHasMutated();
            }
        });

        ipc.on('get-manga-list-done', function() {
            self.requesting = false;
            self.searching(false);
            self.showGuide(self.mangas().length <= 0);
            console.log("this.mangas.length", self.mangas().length);
        });
        this.subscriptions.push(computed);
        this.subscriptions.push(sub);
        this.subscriptions.push(sub2);
        this.subscriptions.push(sub3);
    }

    dispose() {
        console.log("MangaListViewmodel::dispose")
        this.subscriptions.forEach(sub => sub.dispose());
        ipc.removeAllListeners(['get-manga-list-progress', 'get-manga-list-done']);
    }

    clearSearch() {
        this.searchValue("");
    }

    afterRender(element, data) {
        // Ps.update($(".content")[0]);
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
                Materialize.toast(`Added to favorites!`, 500);
            }
        } else {
            this.favorites.remove(manga.folderPath);
            Materialize.toast(`Removed from favorites!`, 500);
        }
    }

    viewManga(manga) {
        this.selectedManga(manga);
        this.currentPage("view-manga-view");
    }

    focusSearch() {
        this.isSearchFocused(false);
        this.isSearchFocused(true);
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
