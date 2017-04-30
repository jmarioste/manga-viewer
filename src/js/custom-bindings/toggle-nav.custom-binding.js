import ko from "knockout";
import _ from "lodash";

let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
ko.bindingHandlers.toggleNav = {
    init: function(element, valueAccessor) {
        var wrapper = ko.unwrap(valueAccessor());
        $(element).on('click', function() {
            $(wrapper).toggleClass("show-nav");
        });

        onDispose(element, function() {
            $(element).off('click')
        });
    }
}
