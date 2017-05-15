import ko from "knockout";
import _ from "lodash";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;

ko.bindingHandlers.modal = {
    init: function (element) {
        $(element).modal({
            startingTop: '50%', // Starting top style attribute
            endingTop: '30%', // Ending top style attribute   
        });
    },
    update: function (element, valueAccessor) {
        let isOpen = ko.unwrap(valueAccessor());
        console.log("update", true)
        if (isOpen && !$(element).hasClass("open")) {
            $(element).modal('open');
        }
        if (!isOpen && $(element).hasClass('open')) {
            $(element).modal('close');
        }
    }
}