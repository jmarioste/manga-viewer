import * as ko from "knockout";
export class Folder {
    constructor(folderName = "",
        lastModified = "",
        isOpen = false,
        children = [],
        level = 0) {

        this.folderName = folderName;
        this.lastModified = lastModified;
        this.isOpen = ko.observable(!!isOpen);
        this.level = level;
        this.children = children;
    }

    toggleFolderOpen() {
        this.isOpen(!this.isOpen());
    }

    paddingLeft() {
        return 5 + 20 * this.level + 'px';
    }
}