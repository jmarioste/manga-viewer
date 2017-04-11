import ko from "knockout";
import _ from "lodash";
import api from "js/common/api.js";

export default class Folder {
    constructor({
        folderName,
        isOpen,
        children,
        level,
        folderPath,
        isBookmarked
    }) {

        this.folderName = folderName || "";
        // this.lastModified = lastModified;
        this.isOpen = ko.observable(!!isOpen);
        this.level = level || 0;
        this.children = ko.observableArray(children || []);
        this.folderPath = folderPath;
        this.isBookmarked = ko.observable(!!isBookmarked);
        var subscription = this.isOpen.subscribe(function(isOpen) {
            var self = this;
            if (isOpen) {
                api.getSubFolders(self.folderPath).then(function(data) {

                    var children = data.folders.map(function(item) {
                        let isBookmarked = _.includes(api.appSettings.bookmarks, item.folderPath);
                        item.level = self.level + 1;
                        item.isBookmarked = isBookmarked;
                        return new Folder(item);
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
        return `${5 + 20 * this.level}px`;
    }
}