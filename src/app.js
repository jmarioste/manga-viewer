import "./scss/master.scss";

import * as $ from "jquery";
import * as ko from "knockout";
import * as customBinding from "./js/custom-bindings.js"
import { ViewModel } from "./js/models/main-viewmodel.js";
import { SidebarViewmodel } from "./js/components/sidebar/sidebar.viewmodel.js";
$(document).ready(function() {
	let vm = new ViewModel();
	SidebarViewmodel.registerComponent();
	ko.applyBindings(vm);
	console.log("Initialized");
});
