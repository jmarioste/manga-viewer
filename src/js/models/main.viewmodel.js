import ko from "knockout";
import _ from "lodash";
import path from "path";

import api from "js/common/api.js";
import Folder from "js/models/folder.viewmodel.js";

export default class ViewModel {
    constructor(params) {
        this.appTitle = "Baiji Manga Viewer";
        // "G:/Users/Shizkun/"
        this.currentFolder = ko.observable(params.currentFolder);
        this.selectedDirectory = ko.observable();
        this.bookmarks = ko.observableArray(_.map(_.without(params.bookmarks, null), function(folderPath) {
            console.log("aaa", folderPath)
            let folderName = path.basename(folderPath);
            return new Folder({
                folderName: folderName,
                folderPath: folderPath
            });
        }));

        this.sub = ko.computed(function() {
            let currentFolder = this.currentFolder();
            // let selectedDirectory = this.selectedDirectory().folderPath;
            let bookmarks = _.map(this.bookmarks(), x => x.folderPath);
            api.writeSettings({
                currentFolder: currentFolder,
                // selectedDirectory:selectedDirectory,
                bookmarks: bookmarks
            })
        }, this).extend({
            rateLimit: 500
        });
    }
}