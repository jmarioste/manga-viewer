import ko from "knockout";
import _ from "lodash";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
let oldFocus = ko.bindingHandlers.hasFocus;
ko.bindingHandlers.hasFocus = {
    init: oldFocus.init,
    update: function(element, valueAccessor, allBindings) {
        let hasFocus = ko.unwrap(valueAccessor());
        if (hasFocus) {
            $(element).select();
            element.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
        oldFocus.update(element, valueAccessor, allBindings);

    }
}
