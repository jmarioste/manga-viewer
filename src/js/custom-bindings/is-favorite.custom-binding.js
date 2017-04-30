import ko from "knockout";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;


ko.bindingHandlers.isFavorite = {
    init: function(element, valueAccessor) {
        let observable = valueAccessor();
        let sub = observable.subscribe(function() {
            $(element).parent(".cbutton").trigger('pulse-effect');
        })
        onDispose(element, function() {
            sub.dispose();
        })
    },
    update: function(element, valueAccessor) {
        let isFavorite = ko.unwrap(valueAccessor());
        if (isFavorite) {
            $(element).text("star");

        } else {
            $(element).text("star_border");
        }
    }
}
