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
        this.command = params.viewMangaCommand;
        this.currentPage = params.currentViewMangaPage;

        this.option = ko.observable(1);
        this.scrollTopOnClick = ko.observable(true);

        this.switchClass = this.switchClass.bind(this);
        this.goNextPage = this.goNextPage.bind(this);
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
        selected.pageImages([selected.thumbnail]);
        let sub = this.command.subscribe(function (command) {
            switch(command){
                case ViewMangaCommand.NextPage: this.goNextPage();
                    break;
                case ViewMangaCommand.PrevPage: this.goToPreviousPage();
                    break;
            };

        }, this);
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
        if (selected && index < selected.pages - 1) {

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

    goToPreviousPage(){
        let index = this.currentPage();
        let selected = this.selectedManga();
        if (selected && index > 0) {
            this.currentPage(index - 1);
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
            end = end || Math.max(this.currentPage() + 3, selected.pages);
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

export const ViewMangaCommand = {
    NextPage: 1,
    PrevPage: 2
}
ViewMangaViewmodel.registerComponent();
