import "scss/master.scss";

import $ from "jquery";
import ko from "knockout";

import "materialize-css";
import "js/common/custom-bindings";
import api from "js/common/api.js";
import ViewModel from "js/models/main.viewmodel.js";
import {
    SidebarViewmodel,
    MangaListViewmodel
} from "js/components/components.js";


$(document).ready(function() {
    // api.getSavedSettings();
    let vm;
    api.getSavedSettings().then(function(settings) {
        console.log(settings);
        vm = new ViewModel(settings);
        SidebarViewmodel.registerComponent();
        MangaListViewmodel.registerComponent();
        ko.applyBindings(vm);
        console.log("Initialized");
    });
});