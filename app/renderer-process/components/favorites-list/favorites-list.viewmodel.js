import template from "./favorites-list.template.html";

import ko from "knockout";
import _ from "lodash";
import $ from "jquery";
import path from "path";

import api from "renderer-process/common/api.js";
import MangaFactory from "renderer-process/common/manga.factory.js";
import Pages from "renderer-process/common/pages.enum";
import logger from "electron-log";

const ipc = window.require('electron').ipcRenderer;

export class FavoritesListViewmodel {
    constructor(params) {
        this.subscriptions = [];
        logger.info("FavoritesListViewmodel", params.favorites());
        this.favorites = params.favorites;
        this.selectedManga = params.selectedManga;
        this.currentPage = params.currentPage;
        this.previousPage = params.previousPage;

        this.searchValue = params.searchValue;
        this.searching = params.searching;

        this.favoritesManga = ko.observableArray([]);
        this.filteredManga = ko.pureComputed(this.filteredManga, this);

        this.toggleFavorites = this.toggleFavorites.bind(this);
        this.viewManga = this.viewManga.bind(this);
        this.initialize();

    }

    // methods
    initialize() {
        var self = this;
        api.getFavorites(this.favorites());

        ipc.on('get-favorites-list-progress', function (event, manga) {
            if (manga) {
                manga.isFavorite = true;
                manga = MangaFactory.getManga(manga);
                self.favoritesManga.push(manga);
            }
        });

        ipc.on('get-favorites-list-done', function () {
            logger.info("this.favoritesManga.length", self.favoritesManga().length);
        });
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.dispose());
    }

    toggleFavorites(manga) {
        manga.isFavorite(!manga.isFavorite());
        if (manga.isFavorite()) {
            this.favorites.push(manga.folderPath);
            this.favoritesManga.push(manga);
        } else {
            this.favorites.remove(manga.folderPath);
            this.favoritesManga.remove(manga);
        }
    }

    clearSearch() {
        this.searchValue("");
    }
    filteredManga() {
        let value = this.searchValue().toLowerCase();
        if (!value) {
            return _.sortBy(this.favoritesManga(), 'mangaTitle');
        } else {
            return _(this.favoritesManga()).filter(function (manga) {
                let title = manga.mangaTitle;
                return _.includes(title.toLowerCase(), value);
            }).sortBy('mangaTitle').value();
        }
    }

    afterAdd(elem) {
        logger.info(elem);
        if ($(elem).hasClass("manga")) {
            Materialize.fadeInImage($(elem));
        }
    }

    viewManga(manga) {
        this.selectedManga(manga);
        this.previousPage(Pages.FavoritesList)
        this.currentPage(Pages.ViewManga);
    }

    static registerComponent() {
        ko.components.register("favorites-list", {
            viewModel: FavoritesListViewmodel,
            template: template,
            synchronous: true
        });
    }
}

FavoritesListViewmodel.registerComponent();
