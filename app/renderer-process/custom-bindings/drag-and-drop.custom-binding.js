import ko from "knockout";
import logger from "electron-log";
import Ps from "perfect-scrollbar";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
ko.bindingHandlers.dragAndDrop = {
    init: function (element, valueAccessor) {
        let selectedFile = valueAccessor();
        let $element = $(element);
        document.addEventListener("dragenter", function( event ) {
            // prevent default to allow drop
            event.preventDefault();
        }, false);

        document.addEventListener("dragover", function () {
            event.preventDefault();
        }, false);

        element.addEventListener("dragover", function (event) {
            event.preventDefault();

            let $target = $(event.target);
            $("#file-drag-overlay").addClass("file-dragging");
            $element.addClass("file-dragging");
            $(element).scrollTop(0);
        }, false);

        document.addEventListener('dragleave', function (event) {
            event.preventDefault();
            

            let $target = $(event.target);
            console.log(event.target.className);
            if ($target.hasClass("file-dragging")) {
                $element.removeClass("file-dragging");
                $("#file-drag-overlay").removeClass("file-dragging");    
            }
        }, false);

        document.addEventListener('drop', function (event) {
            event.preventDefault();
            const files = event.dataTransfer.files;
            const file = files[0];
            const $target = $(event.target);
            const isManga = /.zip$|.rar$/gm.test(file.path)

            console.log("document. on drop");
            if ($target.hasClass("file-dragging")) {
                if (file &&  isManga) {
                    logger.debug('File is', file.path);
                    selectedFile(file.path);

                    $element.removeClass("file-dragging");
                    $("#file-drag-overlay").removeClass("file-dragging");
                    Ps.update(element);
                }
            }
            
            return false;
        }, false)

    }
}