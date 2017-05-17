import ko from "knockout";

let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;


ko.bindingHandlers.tooltip = {
    init: function (element, valueAccessor, allBindings) {
        let position = ko.unwrap(valueAccessor());
        let text = allBindings.get('tooltipText') || allBindings.get('text');
        $(element).on('mouseenter', function () {
            $(element).attr('data-tooltip', text);
            $(element).tooltip({
                delay: 50,
                position: position
            });
            $(element).trigger('mouseenter.tooltip')
        });

        $(element).on('mouseout', function () {
            $(element).tooltip('remove');
        });

        onDispose(element, function (element) {
            $(element).tooltip('remove');
        })
    }
}
