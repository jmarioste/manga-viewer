import ko from "knockout";
import logger from "electron-log";
import Ps from "perfect-scrollbar";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
ko.bindingHandlers.dragAndDrop = {
    init: function (element, valueAccessor) {
        let selectedFile = valueAccessor();
        let $element = $(element);
        $(element).on('dragover', function () {
            logger.debug("dragging inside element");
            $element.addClass("file-dragging");
            $("#file-drag-overlay").addClass("file-dragging");
            $element.scrollTop(0);
            return false;
        });

        $element.on('dragleave', function () {
            logger.debug("dragging outside element");
            $element.addClass("file-dragging");
            $("#file-drag-overlay").removeClass("file-dragging");
            return false;
        });

        $element.on('drop', function (e) {
            e.preventDefault();
            let files = e.originalEvent.dataTransfer.files;
            let file = files[0];

            if (file && e.originalEvent.isTrusted) {
                logger.debug('File is', file.path);
                selectedFile(file.path);
            }

            $element.removeClass("file-dragging");
            $("#file-drag-overlay").removeClass("file-dragging");
            Ps.update(element);
            return false;
        })

        onDispose(element, function () {
            $element.off("dragover dragleave drop");
        })
    }
}