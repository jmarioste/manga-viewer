import template from "./favorites-list.template.html";

import ko from "knockout";
import _ from "lodash";
import $ from "jquery";
import path from "path";

import api from "js/common/api.js";
import MangaFactory from "js/common/manga.factory.js";


const ipc = window.require('electron').ipcRenderer;

export class FavoritesListViewmodel {
    constructor(params) {
        this.subscriptions = [];
        console.log("FavoritesListViewmodel", params.favorites);
        this.favorites = params.favorites;

        this.searchValue = ko.observable("").extend({
            rateLimit: {
                timeout: 500,
                method: "notifyWhenChangesStop"
            }
        });
        this.searching = ko.observable(false).extend({
            rateLimit: 300
        });
        this.mangaFactory = new MangaFactory();
        this.favoritesManga = ko.computed(this.favoritesManga, this);
        this.filteredManga = ko.computed(this.filteredManga, this);
        this.toggleFavorites = this.toggleFavorites.bind(this);
        this.initialize();


    }

    // methods
    initialize() {
        this.favorites.subscribe(function(favorites) {
            console.log("FavoritesListViewmodel::favorites", favorites.length);
        }, this);
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.dispose());
        this.selectedDirectory = null;
        this.favorites([]);
        this.favoritesManga.dispose();
    }

    toggleFavorites(manga) {
        manga.isFavorite(!manga.isFavorite());
        if (manga.isFavorite()) {
            this.favorites.push(manga.folderPath);
        } else {
            this.favorites.remove(manga.folderPath);
        }
    }

    favoritesManga() {

        let favorites = this.favorites().map((folderPath) => {
            let mangaTitle = path.basename(folderPath);
            let isFavorite = true;
            console.log(folderPath);
            return this.mangaFactory.getManga({
                mangaTitle,
                folderPath,
                isFavorite
            });
        });
        console.log("FavoritesListViewmodel::favoritesManga", favorites);
        return favorites;
    }
    filteredManga() {
        let value = this.searchValue().toLowerCase();
        if (!value) {
            return this.favoritesManga();
        } else {
            return _.filter(this.favoritesManga(), function(manga) {
                let title = manga.mangaTitle;
                return _.includes(title.toLowerCase(), value);
            });
        }
    }

    static registerComponent() {
        ko.components.register("favorites-list", {
            viewModel: FavoritesListViewmodel,
            template: template
        });
    }
}
