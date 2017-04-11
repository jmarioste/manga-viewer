import ko from "knockout";
import $ from "jquery";
import _ from "lodash";
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
            $(element).text("folder_open");
        } else {
            $(element).text("folder");
        }
    }
}


ko.bindingHandlers.active = {
    update: function(element, valueAccessor) {
        var active = ko.unwrap(valueAccessor());

        if (active) {
            $(element).addClass("active");
        } else {
            $(element).removeClass("active");
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

ko.bindingHandlers.tooltip = {
    init: function(element, valueAccessor) {
        let text = ko.unwrap(valueAccessor());
        $(element).tooltip({
            viewport: {
                selector: 'body',
                padding: 0
            }
        });
    }
}


ko.bindingHandlers.toggleBookmark = {
    update: function(element, valueAccessor) {
        var isBookmarked = ko.unwrap(valueAccessor());

        if (isBookmarked) {
            $(element).text("bookmark");
        } else {
            $(element).text("bookmark_border");
        }
    }
}

ko.bindingHandlers.materialSelect = {
    init: function(element, valueAccessor) {
        let searchOption = valueAccessor();
        $(element).material_select();
        $(element).on('change', function() {
            // console.log("changed", $(element).val());
            searchOption($(element).val());
        })
    },
    update: function(element, valueAccessor, allBindings) {
        let value = ko.unwrap(valueAccessor());
        console.log("ko.bindingHandlers.materialSelect::update - value", value);
        $(element).material_select();
    }
}
