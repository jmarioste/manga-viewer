
ko.bindingHandlers.hideNotPlatform = {
    init: function (element, valueAccessor) {
        const value = ko.unwrap(valueAccessor());
        const platform = navigator.platform.toLowerCase();
        const isPlatform = platform.indexOf(value) >= 0;
        console.log(isPlatform, value);
        if (!isPlatform) {
            console.log("applying active");
            $(element).hide();
        }
    }
}

ko.bindingHandlers.href = {
    init: function (element, valueAccessor) {
        const value = ko.unwrap(valueAccessor());
        $(element).attr('href', value);
    }
}