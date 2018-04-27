import ko from "knockout";
import _ from "lodash";
import $ from "jquery";
import Ps from "perfect-scrollbar";
import api from "renderer-process/common/api.js";
import MangaFactory from "renderer-process/common/manga.factory.js";
import template from "./manga-list.template.html";
import Command from "renderer-process/models/command.viewmodel";
import Pages from "renderer-process/common/pages.enum";
import logger from "electron-log";
const ipc = window.require('electron').ipcRenderer;

export class MangaListViewmodel {
    constructor(params) {
        logger.info("MangaListViewmodel::constructor - end");
        var self = this;
        this.subscriptions = [];

        //params
        this.selectedDirectory = params.selectedDirectory;
        this.bookmarks = params.bookmarks;
        this.favorites = params.favorites;
        this.currentPage = params.currentPage;
        this.previousPage = params.previousPage;
        this.selectedManga = params.selectedManga;
        this.pagination = params.pagination;
        this.scrollEnd = params.scrollEnd;
        this.searching = params.searching;
        this.appCommands = params.appCommands;


        this.isRecursive = params.isRecursive;
        this.searchValue = params.searchValue
        this.isSearchFocused = ko.observable(false);
        this.mangas = ko.observableArray([]);

        //computed variables
        this.toggleBookmark = this.toggleBookmark.bind(this);
        this.toggleFavorites = this.toggleFavorites.bind(this);
        this.clearSearch = this.clearSearch.bind(this);
        this.viewManga = this.viewManga.bind(this);
        this.focusSearch = this.focusSearch.bind(this);
        this.afterAdd = this.afterAdd.bind(this);
        this.selectedDirectoryText = ko.pureComputed(this.selectedDirectoryText, this);
        this.isBookmarked = ko.pureComputed(this.isBookmarked, this);


        this.isRecursiveText = ko.pureComputed(function () {
            return this.isRecursive() ? "On" : "Off";
        }, this);
        this.requesting = null;

        this.initialize();
        this.commands = [
            new Command(this.appCommands().BOOKMARK_FOLDER, this.toggleBookmark),
            new Command(this.appCommands().FOCUS_SEARCH, this.focusSearch)

        ];


        logger.info("MangaListViewmodel::constructor - end");
    }

    // methods
    initialize() {
        var self = this;
        logger.info("MangaListViewmodel::initialize - ", this.selectedDirectory());
        let computed = ko.computed(function function_name(argument) {
            let value = this.searchValue().toLowerCase();
            let selected = this.selectedDirectory();
            let isRecursive = this.isRecursive();
            if (!this.requesting && selected) {
                logger.info("MangaListViewmodel::computed");
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

        let sub = this.selectedDirectory.subscribe(function () {
            this.searchValue("");
        }, this);

        let sub3 = this.scrollEnd.subscribe(function (scrollEnd) {
            logger.info("scrollEnd", scrollEnd);
            if (scrollEnd && !this.requesting) {
                this.pagination(this.pagination() + 1);
            }
        }, this);
        let sub2 = this.pagination.subscribe(function (pagination) {
            logger.info("pagination updated");
            let value = this.searchValue().toLowerCase();
            let selected = this.selectedDirectory();
            let isRecursive = this.isRecursive();

            if (!this.requesting && selected) {
                logger.info("MangaListViewmodel::pagination changed", pagination);
                let path = selected.folderPath;
                api.getMangaList(path, isRecursive, value, pagination);
                this.requesting = true;
                this.searching(true);
                this.scrollEnd(false);
            }
        }, this);

        ipc.on('get-manga-list-progress', function (event, manga) {
            if (manga) {
                manga.isFavorite = _.includes(self.favorites(), manga.folderPath);
                manga = MangaFactory.getManga(manga);
                self.mangas.push(manga);
            }
        });

        ipc.on('get-manga-list-done', function () {
            self.requesting = false;
            self.searching(false);
            // self.showGuide(self.mangas().length <= 0);
            logger.info(`this.mangas.length ${self.mangas().length}`);
        });

        this.subscriptions.push(computed);
        this.subscriptions.push(sub);
        this.subscriptions.push(sub2);
        this.subscriptions.push(sub3);
    }

    dispose() {
        logger.info("MangaListViewmodel::dispose")
        this.subscriptions.forEach(sub => sub.dispose());
        ipc.removeAllListeners(['get-manga-list-progress', 'get-manga-list-done']);
    }
    afterAdd(elem) {
        if ($(elem).hasClass("manga")) {
            Materialize.fadeInImage($(elem));
        }

    }
    clearSearch() {
        this.searchValue("");
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
                this.bookmarks.push(current);
            } else {
                this.bookmarks.remove(function (folder) {
                    return folder.folderPath === current.folderPath;
                });
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
        this.previousPage(Pages.MangaList);
        this.currentPage(Pages.ViewManga);

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
