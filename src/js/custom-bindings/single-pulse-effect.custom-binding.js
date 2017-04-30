import ko from "knockout";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;

ko.bindingHandlers.singlePulseEffect = {
    init: function(element, valueAccessor) {

        let $element = $(element);
        $element.addClass("cbutton cbutton--effect-boris")
        $element.find("material-icons").addClass("cbutton__icon")
        $element.on('pulse-effect', function() {
            console.log("single pulse click")
            $element.addClass('cbutton--click');
            $element.on('animationend', function() {
                $element.off('animationend');
                $element.removeClass('cbutton--click');
            });
        })
        $element.on('click', function() {
            $element.trigger('pulse-effect');
        })

        onDispose(element, function() {
            console.log("onDispose", "singlePulseEffect");
            $element.off("click");
        });
    }
}
