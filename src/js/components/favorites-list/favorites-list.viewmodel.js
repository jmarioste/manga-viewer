import ko from "knockout";
import _ from "lodash";
import $ from "jquery";
import api from "js/common/api.js";
import template from "./favorites-list.template.html";

const ipc = window.require('electron').ipcRenderer;

export class FavoritesListViewmodel {
    constructor(params) {
        this.subscriptions = [];
        this.favorites = ko.observableArray();

        this.searchValue = ko.observable("").extend({
            rateLimit: {
                timeout: 500,
                method: "notifyWhenChangesStop"
            }
        });
        this.searching = ko.observable(false).extend({
            rateLimit: 300
        });

        //computed variables
        this.toggleBookmark = this.toggleBookmark.bind(this);
        this.initialize();
    }

    // methods
    initialize() {
        
    }

    dispose() {
        this.subscriptions.forEach(sub => sub.dispose());
        this.selectedDirectory = null;
        this.mangas([]);
    }

    toggleBookmark() {
        //TODO       
    }


    filteredManga() {
        let value = this.searchValue().toLowerCase();
        if (!value) {
            return this.mangas();
        } else {
            return _.filter(this.mangas(), function(manga) {
                let title = manga.mangaTitle;
                return _.includes(title.toLowerCase(), value);
            });
        }
    }

    static registerComponent() {
        ko.components.register("manga-list", {
            viewModel: FavoritesListViewmodel,
            template: template
        });
    }
}
