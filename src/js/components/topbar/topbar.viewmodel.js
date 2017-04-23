import ko from "knockout";
import _ from "lodash";
import $ from "jquery";

import api from "js/common/api.js";
import template from "./topbar.template.html";
import {
    ViewMangaCommand
} from "js/components";
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
        this.currentViewMangaPage = params.currentViewMangaPage;
        this.viewMangaCommand = params.viewMangaCommand;
        this.searching = params.searching;
        this.mangaTitle = ko.pureComputed(this.mangaTitle, this);
        this.isFavorite = ko.pureComputed(this.isFavorite, this);
        this.topBarText = ko.pureComputed(this.topBarText, this);
        this.showSidebar = ko.observable();
        this.goNextPage = this.goNextPage.bind(this);
        this.goPrevPage = this.goPrevPage.bind(this);
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

    goNextPage() {
        this.viewMangaCommand(ViewMangaCommand.NextPage);
    }

    goPrevPage() {
        this.viewMangaCommand(ViewMangaCommand.PrevPage);
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
