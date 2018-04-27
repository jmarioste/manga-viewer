import ko from "knockout";
import _ from "lodash";
import path from "path";
import api from "renderer-process/common/api.js";
import Pages from "renderer-process/common/pages.enum";
import Folder from "renderer-process/models/folder.viewmodel.js";
import { DefaultCommandHotkeys } from "renderer-process/models/command.viewmodel";
import { autoUpdater } from "renderer-process/common/auto-updater";
import logger from "electron-log";
import { remote } from "electron";
export default class ViewModel {
    constructor(params) {
        logger.info("MainViewModel::constructor")
        params.bookmarks = _.without(params.bookmarks, null);
        let self = this;
        this.subscriptions = [];
        this.appTitle = ko.observable("Baiji Manga Viewer");
        this.currentPage = ko.observable(params.currentPage || Pages.MangaList);
        this.currentFolder = ko.observable(params.currentFolder);
        this.selectedDirectory = ko.observable();
        this.favorites = ko.observableArray(params.favorites);
        this.selectedManga = ko.observable();
        this.selectedMangaPath = ko.observable(params.selectedMangaPath).extend({ notify: 'always' });
        this.currentViewMangaPage = ko.observable(0);
        this.viewMangaCommand = ko.observable(null).extend({ notify: 'always' });
        this.pagination = ko.observable(0);
        this.scrollEnd = ko.observable(false).extend({ rateLimit: 500 });
        this.appCommands = ko.observable(_.extend({}, DefaultCommandHotkeys, params.appCommands));
        this.bookmarks = ko.observableArray(this.getBookmarks(params));
        this.searching = ko.observable(false);
        this.searchValue = ko.observable("");
        this.isRecursive = ko.observable(params.isRecursive);
        this.isDetectUpdatesOnStart = ko.observable(params.isDetectUpdatesOnStart);
        this.previousPage = ko.observable(params.previousPage || Pages.MangaList)
        this.initialize();
    }

    initialize() {
        let sub = ko.computed(function () {
            let currentFolder = this.currentFolder();
            let bookmarks = _.map(this.bookmarks(), 'folderPath');
            let favorites = this.favorites();
            let selectedMangaPath = this.selectedManga() ? this.selectedManga().folderPath : this.selectedMangaPath();
            let appCommands = _.extend({}, DefaultCommandHotkeys, this.appCommands());
            api.writeSettings({
                currentFolder,
                bookmarks,
                favorites,
                isRecursive: this.isRecursive(),
                currentPage: this.currentPage(),
                previousPage: this.previousPage(),
                appCommands: appCommands,
                selectedMangaPath: selectedMangaPath,
                isDetectUpdatesOnStart: this.isDetectUpdatesOnStart()
            });
        }, this).extend({
            rateLimit: 500
        });

        // let sub2 = this.selectedManga.subscribe(function (manga) {
        //     if (manga) {
        //         this.selectedDirectory(null);
        //     }
        // }, this);
        let sub3 = this.selectedMangaPath.subscribe(function (path) {
            logger.debug("selectedMangaPath changed", path);
            if (path) {
                // this.selectedDirectory(null);
                this.currentPage(Pages.MangaList);
                this.currentPage(Pages.ViewManga);
            }
        }, this);

        this.subscriptions.push(sub);
        // this.subscriptions.push(sub2);

        if (this.isDetectUpdatesOnStart()) {
            logger.info("checking for updates..");
            autoUpdater.checkForUpdates();
        }
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.dispose());
    }

    getBookmarks(params) {
        return _.map(params.bookmarks, function (folderPath) {
            let folderName = path.basename(folderPath);
            return new Folder({
                folderName: folderName,
                folderPath: folderPath,
                isBookmarked: true
            });
        })
    }
    closeWindow() {
        let current = remote.getCurrentWindow();
        current.close();
    }

    minimize() {
        let current = remote.getCurrentWindow();
        current.minimize();
    }
    maximize() {
        let current = remote.getCurrentWindow();
        if (current.isMaximized()) {
            current.unmaximize();
        } else {
            current.maximize();
        }

    }
}
