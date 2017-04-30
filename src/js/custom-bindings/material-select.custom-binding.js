import ko from "knockout";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;


ko.bindingHandlers.materialSelect = {
    init: function(element, valueAccessor) {
        let searchOption = valueAccessor();
        $(element).material_select();
        $(element).on('change', function() {
            searchOption($(element).val());
        })

        onDispose(element, function() {
            $(element).material_select('destroy');
        });
    },
    update: function(element, valueAccessor, allBindings) {
        let value = ko.unwrap(valueAccessor());
        $(element).material_select();
    }
}
