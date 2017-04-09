import ko from "knockout";
export default class ViewModel {
    constructor() {
        this.appTitle = "Baiji Manga Viewer";
        this.currentFolder = ko.observable("G:/Users/Shizkun/");
        this.selectedDirectory = ko.observable(null);
    }
}