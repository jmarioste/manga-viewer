import ko from "knockout";
import remote from "electron"
ko.bindingHandlers.href = {
    init: (element, valueAccessor) => {
        let href = ko.unwrap(valueAccessor());
        $(element).attr("href", "javascript:void(0);");
        $(element).on('click', function (event) {
            event.preventDefault();
            remote.shell.openExternal(href);
        })
    }
}