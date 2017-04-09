import * as ko from "knockout";
import * as _ from "lodash";
import {
    api
} from "../../api/api.js";
import {
    Folder
} from "../folder.viewmodel.js";
import * as htmlTemplate from "./sidebar.template.html";
const ipc = window.require('electron').ipcRenderer;

export class SidebarViewmodel {

    constructor() {
        console.log("SidebarViewmodel::constructor");
        var self = this;
        this.favorites = ko.observableArray();
        this.folders = ko.observableArray();
        this.directories = ko.computed(this.getFolderTree, this).extend({
            rateLimit: 50
        });
        this.map = {};

        this.selectedDirectory = ko.observable();
        this.selectDirectory = this.selectDirectory.bind(this);
        this.currentFolder = ko.observable("G:/Users/Shizkun/");
        this.subs = [];

        ipc.on('selected-directory', function(event, path) {
            console.log(`You selected ${path}`);
            self.currentFolder(path[0]);
            self.initialize()
        });

        this.initialize();
    }

    initialize() {
        let self = this;
        var last = this.currentFolder();
        var root = new Folder(last,
            null,
            false, [],
            0,
            last);
        self.folders([root]);
        root.isOpen(true); //initialize to call API.
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
}

SidebarViewmodel.registerComponent = function() {
    ko.components.register("sidebar", {
        viewModel: SidebarViewmodel,
        template: htmlTemplate
    });
};