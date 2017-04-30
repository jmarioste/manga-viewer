import "scss/master.scss";

import $ from "jquery";
import ko from "knockout";

import "materialize-css";
import "js/custom-bindings";
import api from "js/common/api.js";
import ViewModel from "js/models/main.viewmodel.js";
import {
    SidebarViewmodel,
    MangaListViewmodel,
    FavoritesListViewmodel,
    ViewMangaViewmodel,
    SettingsPageViewmodel
} from "js/components";


$(document).ready(function() {

    api.getSavedSettings().then(function(settings) {
        ko.applyBindings(new ViewModel(settings));
    });
});
