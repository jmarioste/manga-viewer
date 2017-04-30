import ko from "knockout";
import _ from "lodash";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
ko.bindingHandlers.switch = {
    init: function(element, valueAccessor) {
        let isOn = valueAccessor();
        $(element).on('change', function() {
            let value = $(element).prop('checked');
            console.log("switch.changed", value);
            isOn(value);
        });
        onDispose(element, function() {
            $(element).off('change');
        });
    },
    update: function(element, valueAccessor, allBindings) {
        let value = ko.unwrap(valueAccessor());
        if (value) {
            $(element).prop('checked', true);
        } else {
            $(element).prop('checked', false);
        }
    }
}
