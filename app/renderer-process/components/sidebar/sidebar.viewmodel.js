import ko from "knockout";
import _ from "lodash";

import api from "renderer-process/common/api";
import Pages from "renderer-process/common/pages.enum";
import Folder from "renderer-process/models/folder.viewmodel";
import template from "./sidebar.template.html";
import Command from "renderer-process/models/command.viewmodel";
import { aboutDialogInstance } from "renderer-process/components";
import path from "path";

export class SidebarViewmodel {

    constructor(params) {
        console.log("SidebarViewmodel::constructor");
        var self = this;
        this.subs = [];
        this.bookmarks = params.bookmarks;
        this.currentPage = params.currentPage;
        this.appCommands = params.appCommands;
        this.currentFolder = params.currentFolder;
        this.selectedDirectory = params.selectedDirectory;
        this.folders = ko.observableArray();

        this.selectDirectory = this.selectDirectory.bind(this);
        this.isFolderActive = this.isFolderActive.bind(this);
        this.selectDirectoryText = ko.pureComputed(this.selectDirectoryText, this);
        this.isFavoritesActive = ko.pureComputed(this.isFavoritesActive, this);
        this.isSettingsActive = ko.pureComputed(this.isSettingsActive, this);
        this.directories = ko.pureComputed(this.getFolderTree, this).extend({ rateLimit: 50 });

        this.commands = [
            new Command(this.appCommands().OPEN_DIRECTORY, this.openDirectory)
        ]
        this.initialize();
    }

    initialize() {
        let self = this;
        let currentFolder = this.currentFolder();
        let isBookmarked = _(this.bookmarks()).map('folderPath').includes(this.currentFolder());
        console.log("SidebarViewmodel::initialize- currentFolder:", currentFolder);
        if (currentFolder) {
            let baseName = path.basename(currentFolder);
            var root = new Folder({
                folderName: baseName,
                folderPath: currentFolder,
                isBookmarked: isBookmarked
            });
            self.folders([root]);
            root.isOpen(true); //initialize to call API.
            self.selectedDirectory(root);
        }
    };

    recursive(folder, array) {
        array.push(folder);
        if (folder.isOpen()) {
            folder.children().forEach((child) => this.recursive(child, array));
        }
        return array;
    }

    getFolderTree() {
        console.log("SidebarViewmodel::getFolderTree");
        let array = [];
        this.folders().forEach((child) => this.recursive(child, array));
        return array;
    }

    selectDirectory(folder) {
        this.selectedDirectory(folder);
        this.currentPage(Pages.MangaList);
    }

    selectDirectoryText() {
        // console.log(this.selectedDirectory().folderName);
        return this.selectedDirectory() ? this.selectedDirectory().folderName : "";
    }

    openDirectory() {
        var self = this;
        api.selectDirectory().then(function (folder) {
            self.currentFolder(folder);
            self.initialize();
        });

    }

    showFavorites() {
        this.currentPage(Pages.FavoritesList);
        this.selectedDirectory(null);
    }

    showSettings() {
        this.currentPage(Pages.SettingsPage);
        this.selectedDirectory(null);
    }

    isFavoritesActive() {
        return this.currentPage() === Pages.FavoritesList;
    }

    isSettingsActive() {
        return this.currentPage() === Pages.SettingsPage;
    }

    isFolderActive(folder) {
        let isFolderSelected = _.includes([Pages.MangaList, Pages.FavoritesList], this.currentPage());
        let sameDirectory = this.selectDirectoryText() === folder.folderName;

        return sameDirectory && isFolderSelected;
    }

    dispose() {
        console.log("SidebarViewmodel:executing dispose");
    };

    showAboutDialog() {
        aboutDialogInstance.shown(true);
    }

    checkForUpdates() {
        // api.checkForUpdates();
    }
    static registerComponent() {
        ko.components.register("sidebar", {
            viewModel: SidebarViewmodel,
            template: template,
            synchronous: true
        });
    };
}

SidebarViewmodel.registerComponent();
