import * as ko from "knockout";
import * as $ from "jquery";
ko.bindingHandlers.toggleNav = {
	init: function (element, valueAccessor) {
		var wrapper = ko.unwrap(valueAccessor());
		$(element).click(function () {
			$(wrapper).toggleClass("show-nav");
		});
	}
}