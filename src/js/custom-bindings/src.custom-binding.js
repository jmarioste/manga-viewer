import ko from "knockout";

ko.bindingHandlers.src = {
    update: function(element, valueAccessor, allBindings) {
        let src = ko.unwrap(valueAccessor());
        let isScrollTop = ko.unwrap(allBindings.get('scrollTopOnClick'));
        $(element).attr('src', src);
        if (isScrollTop) {
            $(".content").scrollTop(0);
        }
    }
}
