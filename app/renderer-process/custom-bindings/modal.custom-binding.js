import ko from "knockout";
import _ from "lodash";
import logger from "electron-log";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;

ko.bindingHandlers.modal = {
    init: function (element, valueAccessor, allBindings) {
        let observable = valueAccessor();
        let onComplete = allBindings.get('onComplete');
        $(element).modal({
            startingTop: '50%', // Starting top style attribute
            endingTop: '30%', // Ending top style attribute  
            complete: function () {
                logger.info("modal-complete");
                onComplete && onComplete();
            }
        });

        $(element).on('modal.close', function () {
            logger.info("modalClose");
        })
        // onDispose(element, function () {
        //     $(element).modal('destroy');
        // })
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