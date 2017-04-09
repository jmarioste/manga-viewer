import "./scss/master.scss";

import * as $ from "jquery";
import "bootstrap";
import * as ko from "knockout";

import * as customBinding from "./js/custom-bindings.js"
import {
    ViewModel
} from "./js/models/main-viewmodel.js";
import {
    SidebarViewmodel
} from "./js/components/sidebar/sidebar.viewmodel.js";

const vm = new ViewModel();
$(document).ready(function() {

    SidebarViewmodel.registerComponent();
    ko.applyBindings(vm);
    console.log("Initialized");
});