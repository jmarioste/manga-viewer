import ko from "knockout";
import _ from "lodash";
import $ from "jquery";

import api from "renderer-process/common/api.js";
import Pages from "renderer-process/common/pages.enum";
import Command from "renderer-process/models/command.viewmodel";
import template from "./topbar.template.html";
import { ViewMangaCommand } from "renderer-process/components";
import logger from "electron-log";
const ipc = window.require('electron').ipcRenderer;

export class TopBarViewmodel {
    constructor(params) {
        logger.info("TopBarViewmodel::constructor - end");
        let self = this;
        this.subscriptions = [];
        this.selectedManga = params.selectedManga;
        this.favorites = params.favorites;
        this.currentPage = params.currentPage;
        this.previousPage = params.previousPage;
        this.appTitle = params.appTitle;
        this.appCommands = params.appCommands;

        this.currentViewMangaPage = params.currentViewMangaPage;
        this.viewMangaCommand = params.viewMangaCommand;
        this.searching = params.searching;
        this.mangaTitle = ko.pureComputed(this.mangaTitle, this);
        this.isFavorite = ko.pureComputed(this.isFavorite, this);
        this.topBarText = ko.pureComputed(this.topBarText, this);
        // this.isShowMenu = ko.pureComputed(this.isShowMenu, this);
        this.isShowBackToListButton = ko.pureComputed(this.isShowBackToListButton, this);
        this.showSidebar = ko.observable();

        this.goNextPage = this.goNextPage.bind(this);
        this.goPrevPage = this.goPrevPage.bind(this);


        logger.info("TopBarViewmodel::constructor - end", this.currentPage());
    }

    // methods
    initialize() {
        this.appCommands.subscribe(function (appCommands) {
            logger.info("New keybindings set in settings");
            this.commands([
                new Command(this.appCommands().BOOKMARK_MANGA, this.toggleFavorite),
            ]);
        });
    }

    dispose() {
        logger.info("TopBarViewmodel::dispose")
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

    toggleFavorite =()=> {
        logger.info("toggleFavorite");
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
            logger.info(this.currentPage(), Pages.MangaList)
            switch (this.currentPage()) {
                case Pages.MangaList: return "Manga list";
                case Pages.FavoritesList: return "Favorites list";
                case Pages.SettingsPage: return "Settings";
                case Pages.ViewManga: return "View Manga";
                default:
                    throw `There's no page named ${this.currentPage()}`
            }
        }
    }
    isShowBackToListButton() {
        if (this.currentPage() === Pages.ViewManga) {
            $('.wrapper').toggleClass('show-nav');
            return true;
        };
        return false;
    }
    backToList = () => {
        logger.info("TopBarViewmodel::backToList")
        this.currentPage(this.previousPage() || Pages.MangaList)
        this.previousPage('');
        $('.wrapper').toggleClass('show-nav');
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
