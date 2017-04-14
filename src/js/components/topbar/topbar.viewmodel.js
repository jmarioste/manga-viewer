import ko from "knockout";
import _ from "lodash";
import $ from "jquery";

import api from "js/common/api.js";
import template from "./topbar.template.html";

const ipc = window.require('electron').ipcRenderer;

export class TopBarViewmodel {
    constructor(params) {
        console.log("TopBarViewmodel::constructor - end");
        let self = this;
        this.subscriptions = [];
        this.selectedManga = params.selectedManga;
        this.favorites = params.favorites;
        this.currentPage = params.currentPage;
        this.appTitle = params.appTitle;
        this.mangaTitle = ko.pureComputed(this.mangaTitle, this);
        this.isFavorite = ko.pureComputed(this.isFavorite, this);
        this.topBarText = ko.pureComputed(this.topBarText, this);
        this.showSidebar = ko.observable();
        console.log("TopBarViewmodel::constructor - end", this.currentPage());
    }

    // methods
    initialize() {

    }

    dispose() {
        console.log("TopBarViewmodel::dispose")
        this.subscriptions.forEach(sub => sub.dispose());
    }

    mangaTitle() {
        let manga = this.selectedManga();
        if (manga) {
            return manga.mangaTitle;
        } else {
            return "";
        }
    }
    toggleFavorite() {
        let manga = this.selectedManga();
        manga.isFavorite(!manga.isFavorite());
        if (manga.isFavorite()) {
            this.favorites.push(manga.folderPath);
        } else {
            this.favorites.remove(manga.folderPath);
        }
    }
    isFavorite() {
        let manga = this.selectedManga();
        if (manga) {
            return manga.isFavorite();
        } else {
            return false;
        }

    }

    topBarText() {
        if (this.selectedManga()) {
            return this.selectedManga().mangaTitle;
        } else {
            return this.appTitle();
        }
    }
    static registerComponent() {
        ko.components.register("topbar", {
            viewModel: TopBarViewmodel,
            template: template,
            synchronous: true
        });
    }
}

TopBarViewmodel.registerComponent();
