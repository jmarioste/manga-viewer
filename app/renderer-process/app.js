import "renderer-process/scss/master.scss";

import $ from "jquery";
import ko from "knockout";

import "materialize-css";
import "renderer-process/custom-bindings";
import api from "renderer-process/common/api.js";
import ViewModel from "renderer-process/models/main.viewmodel.js";
import "renderer-process/components";

console.log("app");
$(document).ready(function() {
    console.log("document.ready");
    api.getSavedSettings().then(function(settings) {
        console.log("applyBindings.ready");
        ko.applyBindings(new ViewModel(settings));
        console.log("applyBindings.done");
    });
});
