import ko from "knockout";

ko.bindingHandlers.visibility = {
    update: function(element, valueAccessor) {
        let isVisible = ko.unwrap(valueAccessor());

        if (isVisible) {
            $(element).css("visibility", "visible");
        } else {
            $(element).css("visibility", "hidden");
        }
        $
    }
}
