import * as ko from "knockout";
import * as _ from "lodash";
import {
    api
} from "../../api/api.js";
import {
    Folder
} from "../folder.viewmodel.js";
import * as htmlTemplate from "./sidebar.template.html";
export class SidebarViewmodel {

    constructor() {
        console.log("SidebarViewmodel::constructor");
        this.favorites = ko.observableArray();
        this.folders = ko.observableArray();
        this.directories = ko.computed(this.getFolderTree, this);
        this.map = {};
        this.initialize();
        this.selectedDirectory = ko.observable();
        this.selectDirectory = this.selectDirectory.bind(this);
        this.currentFolder = ko.computed(this.currentFolder, this).extend({
            rateLimit: 0
        });
        this.subs = [];
    }

    initialize() {
        let self = this;
        var last = "G:/Users/Shizkun/";
        var root = new Folder(last,
            null,
            false, [],
            0,
            last);
        self.folders([root]);
        root.isOpen(true);
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
    }

    currentFolder() {
        var first = _.first(this.directories()) || {};
        return first.folderName || "";
    }
    dispose() {
        console.log("SidebarViewmodel:executing dispose");
    };
}

SidebarViewmodel.registerComponent = function() {
    ko.components.register("sidebar", {
        viewModel: SidebarViewmodel,
        template: htmlTemplate
    });
};