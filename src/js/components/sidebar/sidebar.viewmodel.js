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
        this.currentFolder = ko.computed(this.currentFolder, this);
    }

    initialize() {
        let self = this;
        api.getSidebarFolderListOf("").then(function(response) {
            self.folders(response.folders);
        })
    };

    getFolderTree() {
        let self = this;
        let array = self.folders();
        let tree = [];

        function recursive(item, level) {
            level = level || 0;
            if (!self.map[item.folderName]) {
                let folder = new Folder(item.folderName,
                    item.lastModified,
                    item.isOpen,
                    item.children, level);

                self.map[item.folderName] = folder;

            }

            let folder = self.map[item.folderName];
            tree.push(folder);
            if (item.children.length && folder.isOpen()) {
                item.children.forEach(function(item) {
                    recursive(item, level + 1);
                });
            }
        }

        array.forEach(recursive);
        return tree;
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
    })
};