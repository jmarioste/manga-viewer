import ko from "knockout";
ko.bindingHandlers.scale = {
    update: function(element, valueAccessor, allBindings) {
        let scale = ko.unwrap(valueAccessor());
        $(element).css('transform', `scale(${scale})`);
    }
}
