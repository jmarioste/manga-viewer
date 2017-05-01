import ko from "knockout";

ko.bindingHandlers.mousewheel = {
    init: function(element, valueAccessor, allBindings) {
        let $element = $(element);

        $element.on('mousewheel', function(event) {
            let delta = event.originalEvent.wheelDeltaY;
            if (delta > 0) {
                $element.trigger('mousewheel-up');
            } else {
                $element.trigger('mousewheel-down');
            }
        })
    }
}
