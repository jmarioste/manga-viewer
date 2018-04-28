
ko.bindingHandlers.highlightDownload = {
    init: function (element, valueAccessor) {
        const value = ko.unwrap(valueAccessor());
        const platform = navigator.platform.toLowerCase();
        const isPlatform = platform.indexOf(value) >= 0;
        console.log(isPlatform, value);
        if (isPlatform) {
            console.log("applying active");
            $(element).addClass("active-btn")
        }
    }
}