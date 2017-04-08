import * as ko from "knockout";
import * as $ from "jquery";
ko.bindingHandlers.toggleNav = {
    init: function(element, valueAccessor) {
        var wrapper = ko.unwrap(valueAccessor());
        $(element).click(function() {
            $(wrapper).toggleClass("show-nav");
        });
    }
}

ko.bindingHandlers.isOpenFolder = {
    update: function(element, valueAccessor) {
        var isOpen = ko.unwrap(valueAccessor());

        if (isOpen) {
            $(element).addClass("fa-folder-open")
                .removeClass("fa-folder");
        } else {
            $(element).addClass("fa-folder")
                .removeClass("fa-folder-open");
        }
    }
}


ko.bindingHandlers.selected = {
    update: function(element, valueAccessor) {
        var selected = ko.unwrap(valueAccessor());

        if (selected) {
            $(element).addClass("selected");
        } else {
            $(element).removeClass("selected");
        }
    }
}

ko.bindingHandlers.scroll = {
    init: function(element, valueAccessor) {
        $(element).css({
            height: `${$(element).outerHeight()}px`,
            'overflow-y': "auto",
            'overflow-x': "hidden"
        });
    }
}