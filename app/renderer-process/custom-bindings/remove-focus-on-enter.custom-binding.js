import ko from "knockout";

let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;

ko.bindingHandlers.removeFocusOnEnter = {
    init: function(element, valueAccessor, allBindings) {
        let hasFocus = allBindings.get('hasFocus');
        $(element).on('keyup', function(event) {
            if (event.key === "Enter") {
                hasFocus(false);
            }
        });
        onDispose(element, function() {
            $(element).off('change');
        });
    },
}
