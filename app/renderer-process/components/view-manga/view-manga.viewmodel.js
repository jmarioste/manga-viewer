import ko from "knockout";
import _ from "lodash";
import $ from "jquery";

import "renderer-process/scss/view-manga.scss";
import "renderer-process/common/ko.custom-functions";

import api from "renderer-process/common/api";
import Pages from "renderer-process/common/pages.enum";
import MangaFactory from "renderer-process/common/manga.factory";
import template from "./view-manga.template.html";
import { viewOptions, ViewOptions } from "./view-options.js";
import Command from "renderer-process/models/command.viewmodel";
const ipc = window.require('electron').ipcRenderer;
import logger from "electron-log";
export class ViewMangaViewmodel {
    constructor(params) {
        logger.info("ViewMangaViewModel::constructor - end");
        let self = this;
        //params
        this.subscriptions = [];
        this.selectedManga = params.selectedManga;
        this.selectedMangaPath = params.selectedMangaPath;
        this.command = params.viewMangaCommand;
        this.currentPage = params.currentViewMangaPage;
        this.appCommands = params.appCommands;
        this.imageFit = params.imageFit;

        //class defined
        this.option = ko.observable(ko.unwrap(params.imageFit));
        this.scrollTopOnClick = ko.observable(true);
        this.page = ko.observable(1);
        this.transformScale = ko.observable(1.0);
        this.viewOptions = ko.observableArray(viewOptions);

        console.log("option", this.option());
        //functions
        this.switchClass = this.switchClass.bind(this);
        this.goNextPage = this.goNextPage.bind(this);
        this.goToPreviousPage = this.goToPreviousPage.bind(this);
        this.viewOption = ko.computed(this.viewOption, this);
        this.currentImage = ko.pureComputed(this.currentImage, this).extend({ rateLimit: 50 });

        this.commands = [
            new Command(this.appCommands().NEXT_PAGE, this.goNextPage),
            new Command(this.appCommands().PREVIOUS_PAGE, this.goToPreviousPage)
        ];

        logger.info("ViewMangaViewModel::constructor - end", this.selectedManga());
        this.initialize();
    }

    // methods
    initialize() {
        // this.preloadNextPages();
        if (!this.selectedManga()) {
            if (this.selectedMangaPath()) {
                let request = api.getManga(this.selectedMangaPath());
                request.then((manga) => {
                    manga = MangaFactory.getManga(manga);
                    this.selectedManga(manga);


                    manga.pageImages([]);
                    this.preloadNextPages(0, 2);
                })
            } else {
                // this.currentPage(0);
            }
        } else {
            this.preloadNextPages(0, 2);
            let selected = this.selectedManga();
            selected.pageImages([]);
        }

        let sub = this.command.subscribe(function (command) {
            switch (command) {
                case ViewMangaCommand.NextPage:
                    this.goNextPage();
                    break;
                case ViewMangaCommand.PrevPage:
                    this.goToPreviousPage();
                    break;
            };
        }, this);
        this.subscriptions.push(sub);
        let viewOption = _.find(this.viewOptions(), (x) => x.value == this.imageFit());
        console.log("viewOption", viewOption);
        this.switchClass(viewOption);
    }

    dispose() {
        logger.info("ViewMangaViewModel::dispose")
        this.subscriptions.forEach(sub => sub.dispose());
        if (this.selectedManga()) {
            this.selectedManga().pageImages([]);
            this.selectedManga(null);
        }

        this.currentPage(0);
    }

    switchClass(viewOption) {
        console.log("inside switchClass", viewOption);

        let last = this.option();
        this.option(viewOption.value);

        switch (viewOption.value) {
            case ViewOptions.Normal:
                this.transformScale(1.0);
                break;
            case ViewOptions.FitToWidth:
                this.transformScale(1.0);
                break;
            case ViewOptions.FitToHeight:
                this.transformScale(1.0);
                break;
            case ViewOptions.ZoomIn:
                let zoomInScale = Math.min(this.transformScale() + .20, 2.0);
                this.transformScale(zoomInScale);
                break;
            case ViewOptions.ZoomOut:
                let zoomOutScale = Math.max(this.transformScale() - .20, 0.5);
                logger.info(zoomOutScale);
                this.transformScale(zoomOutScale);
                break;
            default:
                this.transformScale(1.0);
                break;
        }
    }

    goNextPage() {
        logger.info("ViewMangaViewmodel::goNextPage");
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

    goToPreviousPage() {
        let index = this.currentPage();
        let selected = this.selectedManga();
        if (selected && index > 0) {
            this.currentPage(index - 1);
        }
    }

    currentImage() {

        let selected = this.selectedManga();

        if (selected) {
            logger.info("changing currentImage");
            return selected.pageImages()[this.currentPage()];
        }
    }

    preloadNextPages(start, end) {

        let selected = this.selectedManga();
        if (selected) {
            start = start || selected.pageImages().length;
            end = end || Math.min(this.currentPage() + 3, selected.pages);
            logger.info("pages", this.currentPage(), start, end);
            return api.getPages(start, end, selected.folderPath)
                .then(function (pages) {

                    pages.forEach(function (page) {
                        selected.pageImages.push(page);
                    });
                });
        }
    }

    viewOption() {
        console.log("View Manga pge: viewOption computed", this.option());
        var returnValue;
        switch (this.option()) {
            case ViewOptions.Normal:

                returnValue = "normal";
                break;
            case ViewOptions.FitToWidth:
                returnValue = "fit-width";
                break;
            case ViewOptions.FitToHeight:
                returnValue = "fit-height";
                break;
            case ViewOptions.ZoomIn:
                returnValue = "zoom-in";
                break;
            case ViewOptions.ZoomOut:
                returnValue = "zoom-out";
                break;
            default:
                returnValue = "normal";
                break;
        }
        console.log("returnValue", returnValue);
        return returnValue;
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
};


ViewMangaViewmodel.registerComponent();
