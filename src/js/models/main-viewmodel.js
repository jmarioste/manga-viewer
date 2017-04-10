import ko from "knockout";
import _ from "lodash";
import path from "path";
import api from "../api/api.js";
import Folder from "../components/folder.viewmodel.js";
export default class ViewModel {
    constructor(params) {
        this.appTitle = "Baiji Manga Viewer";
        // "G:/Users/Shizkun/"
        this.currentFolder = ko.observable(params.currentFolder);
        this.selectedDirectory = ko.observable();
        this.bookmarks = ko.observableArray(_.map(params.bookmarks, function(folderPath) {
            let folderName = path.basename(folderPath);
            return new Folder(folderName, 0, false, 0, [], folderPath, true);
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