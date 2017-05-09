import ko from "knockout";

import Ps from "perfect-scrollbar";

let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;

ko.bindingHandlers.scroll = {
    init: function(element, valueAccessor, allBindings) {
        let options = ko.unwrap(valueAccessor());
        $(element).css({
            height: `${$(element).outerHeight()}px`,
        });

        Ps.initialize(element, options);
        onDispose(element, function() {
            Ps.destroy(element);
        })
    },
    update: function(element, valueAccessor) {
        $(element).css({
            height: `${$(element).outerHeight()}px`,
        });
        Ps.update(element);
    }
}
