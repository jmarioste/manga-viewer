import "./scss/master.scss";

import $ from "jquery";
import ko from "knockout";

import "bootstrap";
import "./js/custom-bindings";

import ViewModel from "./js/models/main-viewmodel.js";
import {
    SidebarViewmodel,
    MangaListViewmodel
} from "./js/components/components.js";


$(document).ready(function() {
    const vm = new ViewModel();
    SidebarViewmodel.registerComponent();
    MangaListViewmodel.registerComponent();
    ko.applyBindings(vm);
    console.log("Initialized");
});