import ko from "knockout";
import jquery from "jquery";

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

ko.bindingHandlers.hashScroll = {
    init: function (element, valueAccessor) {
        console.log("hash", element.hash);
        $(element).on('click', () => {
            if (element.hash !== "") {
                event.preventDefault();
                const hash = element.hash;
                $('html, body').animate({
                    scrollTop: $(hash).offset().top
                }, 900, function () {
                    window.location.hash = hash;
                });
            }
        })
    }
}