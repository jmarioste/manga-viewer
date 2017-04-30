import ko from "knockout";

ko.bindingHandlers.onEnter = {
    init: function(element, valueAccessor, allBindngs, viewModel) {

        $("body").on('keyup', function(event) {
            let isEnterKey = event.keyCode === '13';
            let execute = ko.unwrap(valueAccessor());
            if (isEnterKey) {
                execute.call(viewModel);
            }
        })
    }
}
