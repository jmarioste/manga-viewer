import ko from "knockout";
import { remote } from "electron";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;

ko.bindingHandlers.maximizedIcon = {
    init: function (element, valueAccessor) {
        var currentWindow = remote.getCurrentWindow();
        if (currentWindow.isMaximized()) {
            $(element).text("filter_none").css('font-size', '16px')
        } else {
            $(element).text("crop_landscape").css('font-size', '24px')
        }
        currentWindow.on('maximize', () => $(element).text("filter_none").css('font-size', '16px'))
        currentWindow.on('unmaximize', () => $(element).text("crop_landscape").css('font-size', '24px'))
        onDispose(element, function () {
            currentWindow = null;
        })
    }
}
