import ko from "knockout";
import _ from "lodash";
let oldFocus = ko.bindingHandlers.hasFocus;
ko.bindingHandlers.hasFocus = {
    init: oldFocus.init,
    update: function(element, valueAccessor, allBindings) {
        let hasFocus = ko.unwrap(valueAccessor());
        if (hasFocus) {
            $(element).select();
            $(window).scrollTop(0);
        }
        oldFocus.update(element, valueAccessor, allBindings);

    }
}
