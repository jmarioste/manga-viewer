import * as ko from "knockout";
import {
    api
} from "../api/api.js";
export class Folder {
    constructor(folderName = "",
        lastModified = "",
        isOpen = false,
        children = [],
        level = 0,
        folderPath) {

        this.folderName = folderName;
        this.lastModified = lastModified;
        this.isOpen = ko.observable(!!isOpen);
        this.level = level;
        this.children = ko.observableArray(children || []);
        this.folderPath = folderPath;

        var subscription = this.isOpen.subscribe(function(isOpen) {
            var self = this;
            if (isOpen) {
                api.getSubFolders(self.folderPath).then(function(data) {
                    var children = data.folders.map(function(item) {
                        return new Folder(item.folderName,
                            item.lastModified,
                            item.isOpen,
                            item.children,
                            self.level + 1,
                            item.folderPath);
                    });

                    self.children(children);
                    subscription.dispose();
                });

            }
        }, this);
    }

    toggleFolderOpen() {
        this.isOpen(!this.isOpen());
    }

    paddingLeft() {
        return 5 + 20 * this.level + 'px';
    }
}