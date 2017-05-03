import ko from "knockout";

ko.bindingHandlers.onEnter = {
    init: function(element, valueAccessor, allBindngs, viewModel) {

        $("body").on('keyup', function(event) {
            let execute = ko.unwrap(valueAccessor());
            if (event.key === 'Enter') {
                execute.call(viewModel);
            }
        })
    }
}
