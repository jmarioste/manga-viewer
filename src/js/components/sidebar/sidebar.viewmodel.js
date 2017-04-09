const ipc = window.require('electron').ipcRenderer;

import ko from "knockout";
import _ from "lodash";

import api from "../../api/api.js";
import Folder from "../folder.viewmodel.js";
import template from "./sidebar.template.html";
import path from "path";

export class SidebarViewmodel {

    constructor(params) {
        console.log("SidebarViewmodel::constructor");
        var self = this;
        this.bookmarks = params.bookmarks;
        this.folders = ko.observableArray();
        this.directories = ko.computed(this.getFolderTree, this).extend({
            rateLimit: 50
        });
        this.map = {};

        this.selectedDirectory = params.selectedDirectory;
        this.selectDirectory = this.selectDirectory.bind(this);
        this.currentFolder = params.currentFolder;
        this.subs = [];

        ipc.on('selected-directory', function(event, data) {
            console.log(`You selected ${data}`);
            self.currentFolder(_.first(data));
            self.initialize()
        });

        this.initialize();
    }

    initialize() {
        let self = this;
        var last = this.currentFolder();
        if (last) {
            let baseName = path.basename(last);
            var root = new Folder(baseName,
                null,
                false, [],
                0,
                last,
                false);
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
    }

    openDirectory() {
        ipc.send('open-file-dialog');
    }
    dispose() {
        console.log("SidebarViewmodel:executing dispose");
    };

    static registerComponent() {
        ko.components.register("sidebar", {
            viewModel: SidebarViewmodel,
            template: template
        });
    };
}