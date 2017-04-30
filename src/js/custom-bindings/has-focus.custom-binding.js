import ko from "knockout";
import _ from "lodash";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
ko.bindingHandlers.oldhasFocus = ko.bindingHandlers.hasFocus;
ko.bindingHandlers.hasFocus = {
    init: ko.bindingHandlers.oldhasFocus.init,
    update: function(element, valueAccessor, allBindings) {
        let hasFocus = ko.unwrap(valueAccessor());
        if (hasFocus) {
            $(element).select();
        }
        ko.bindingHandlers.oldhasFocus.update(element, valueAccessor, allBindings);

    }
}
