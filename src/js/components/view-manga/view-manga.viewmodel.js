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
        this.option = ko.observable(0);
        this.viewOption = ko.pureComputed(this.viewOption, this);
        this.switchClass = this.switchClass.bind(this);
        console.log("ViewMangaViewModel::constructor - end", this.selectedManga());
    }

    // methods
    initialize() {

    }

    dispose() {
        console.log("ViewMangaViewModel::dispose")
        this.subscriptions.forEach(sub => sub.dispose());
        this.selectedManga(null);
    }

    switchClass() {
        let last = this.option();
        if (last < 3) {
            this.option(last + 1);
        } else {
            this.option(0);
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
