import template from "./settings-page.template.html";

import ko from "knockout";
import _ from "lodash";
import $ from "jquery";
import path from "path";

import api from "js/common/api.js";
import MangaFactory from "js/common/manga.factory.js";


const ipc = window.require('electron').ipcRenderer;

export class SettingsPageViewmodel {
    constructor(params) {
        this.subscriptions = [];
        this.isRecursive = params.isRecursive;
        this.commands = params.commands;
        console.log(this.commands());
        this.isRecursiveText = ko.pureComputed(function() {
            return this.isRecursive() ? "On" : "Off";
        }, this);
        this.bookmarkFolderBinding = ko.observable(this.commands().BOOKMARK_FOLDER);
        this.nextPageKey = ko.observable(this.commands().NEXT_PAGE);
        this.previousPageKey = ko.observable(this.commands().PREVIOUS_PAGE);
        this.initialize();
    }

    // methods
    initialize() {
        let commands = this.commands();
        let sub = ko.computed(function() {
            let bookmarkFolderBinding = this.bookmarkFolderBinding();
            let nextPageKey = this.nextPageKey();
            let previousPageKey = this.previousPageKey();
            let newCommands = _.extend(commands, {
                BOOKMARK_FOLDER: bookmarkFolderBinding,
                NEXT_PAGE: nextPageKey,
                PREVIOUS_PAGE: previousPageKey
            });
            this.commands(newCommands);
        }, this).extend({
            rateLimit: 50
        });
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.dispose())
    }



    static registerComponent() {
        ko.components.register("settings-page", {
            viewModel: SettingsPageViewmodel,
            template: template,
            synchronous: true
        });
    }
}

SettingsPageViewmodel.registerComponent();
