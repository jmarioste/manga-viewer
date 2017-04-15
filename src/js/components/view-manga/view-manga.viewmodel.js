import ko from "knockout";
import _ from "lodash";
import $ from "jquery";

import "scss/view-manga.scss";
import api from "js/common/api";
import "js/common/ko.custom-functions";
import template from "./view-manga.template.html";

const ipc = window.require('electron').ipcRenderer;

export class ViewMangaViewmodel {
    constructor(params) {
        console.log("ViewMangaViewModel::constructor - end");
        let self = this;
        this.subscriptions = [];
        this.selectedManga = params.selectedManga;
        this.option = ko.observable(1);
        this.scrollTopOnClick = ko.observable(true);

        this.switchClass = this.switchClass.bind(this);
        this.goNextPage = this.goNextPage.bind(this);
        this.currentPage = ko.observable(0);
        this.viewOption = ko.pureComputed(this.viewOption, this);
        this.currentImage = ko.pureComputed(this.currentImage, this).extend({
            rateLimit: 50
        });

        console.log("ViewMangaViewModel::constructor - end", this.selectedManga());
        this.initialize();
    }

    // methods
    initialize() {
        // this.preloadNextPages();
        this.preloadNextPages(1, 2);
        let selected = this.selectedManga();
        selected.pageImages([selected.thumbnail])
    }

    dispose() {
        console.log("ViewMangaViewModel::dispose")
        this.subscriptions.forEach(sub => sub.dispose());
        this.selectedManga().pageImages([]);
        this.selectedManga(null);
        this.currentPage(0);
    }

    switchClass() {
        let last = this.option();
        if (last < 3) {
            this.option(last + 1);
        } else {
            this.option(0);
        }
    }

    goNextPage() {
        //TODO: Return Logic for execeeding last page.
        let index = this.currentPage();
        let selected = this.selectedManga();
        if (selected) {

            let lastIndex = selected.pageImages().length - 1;
            if (lastIndex - this.currentPage() <= 3) {
                this.preloadNextPages().then(() => {
                    this.currentPage(index + 1);
                    return;
                });
            } else {
                this.currentPage(index + 1);
            }

        }

    }

    currentImage() {

        let selected = this.selectedManga();

        if (selected) {
            console.log("changing currentImage");
            return selected.pageImages()[this.currentPage()];
        }
    }

    preloadNextPages(start, end) {

        let selected = this.selectedManga();
        if (selected) {
            start = start || selected.pageImages().length;
            end = end || this.currentPage() + 3;
            console.log("pages", this.currentPage(), start, end);
            return api.getPages(start, end, selected.folderPath)
                .then(function(pages) {

                    pages.forEach(function(page) {
                        selected.pageImages.push(page);
                    });
                });
        }
    }

    viewOption() {
        switch (this.option()) {
            case 0:
                return "normal";
                break;
            case 1:
                return "fit-width";
            case 2:
                return "fit-height";
            case 3:
                return "zoom";
            default:
                return "normal";
                break;
        }
    }
    static registerComponent() {
        ko.components.register("view-manga", {
            viewModel: ViewMangaViewmodel,
            template: template,
            synchronous: true
        });
    }
}

ViewMangaViewmodel.registerComponent();
