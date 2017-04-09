import ko from "knockout";
export default class ViewModel {
    constructor() {
        this.appTitle = "Baiji Manga Viewer";
        // "G:/Users/Shizkun/"
        this.currentFolder = ko.observable("");
        this.selectedDirectory = ko.observable(null);
        this.bookmarks = ko.observableArray();
    }
}