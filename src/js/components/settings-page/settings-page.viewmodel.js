import template from "./settings-page.template.html";

import ko from "knockout";
import _ from "lodash";
import $ from "jquery";
import path from "path";

import api from "js/common/api.js";
import { ViewOptions } from "js/components";
import { SelectItem } from "js/models";

const ipc = window.require('electron').ipcRenderer;

export class SettingsPageViewmodel {
    constructor(params) {
        this.subscriptions = [];
        this.isRecursive = params.isRecursive;
        this.commands = params.commands;
        this.viewOption = ko.observable(ViewOptions.Default)
        this.viewOptions = ko.observableArray([
            new SelectItem("Normal size", ViewOptions.Default),
            new SelectItem("Fit to width", ViewOptions.FitToWidth),
            new SelectItem("Fit to height", ViewOptions.FitToHeight),
        ]);

        this.isRecursiveText = ko.pureComputed(function() {
            return this.isRecursive() ? "On" : "Off";
        }, this);

        this.commandsList = this.getCommandList();
        this.initialize();
    }

    // methods
    initialize() {
        let commands = this.commands();
        let sub = ko.computed(function() {
            let newCommands = _.reduce(this.commandsList, function(acc, next) {
                acc[next.commandName] = next.hotkey();
                return acc;
            }, {});
            this.commands(_.extend(commands, newCommands));
        }, this).extend({
            rateLimit: 50
        });

        this.subscriptions.push(sub);
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.dispose())
        _.each(this.commandList, item => item.dispose());
    }

    getLabelFor(key) {
        let map = {
            BOOKMARK_FOLDER: "Bookmark folder",
            BOOKMARK_MANGA: "Add to favorites",
            NEXT_PAGE: "Next page",
            PREVIOUS_PAGE: "Previous page",
            FOCUS_SEARCH: "Focus search",
            OPEN_DIRECTORY: "Open directory",

        }
        return map[key] || key;
    }

    getCommandList() {
        return _.map(this.commands(), (hotkey, key) => {
            let label = this.getLabelFor(key);
            let item = new CommandsListItem(key, hotkey, label);

            item.sub = item.hotkey.subscribe(function(value) {
                let duplicate = _.find(this.commandsList, function(dup) {
                    return dup.hotkey() == value && dup != item;
                });
                if (duplicate) {
                    duplicate.hotkey("");
                }

            }, this);

            return item;
        });
    }
    static registerComponent() {
        ko.components.register("settings-page", {
            viewModel: SettingsPageViewmodel,
            template: template,
            synchronous: true
        });
    }
}

export class CommandsListItem {
    constructor(commandName, hotkey, label) {
        this.label = label;
        this.hotkey = ko.observable(hotkey);
        this.commandName = commandName;

        console.log("CommandsListItem::constructor", commandName, hotkey, label);
    }

    dispose() {
        this.sub.dispose();
    }

}
SettingsPageViewmodel.registerComponent();
