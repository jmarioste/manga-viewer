import ko from "knockout";
import _ from "lodash";
import Ps from "perfect-scrollbar";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
ko.bindingHandlers.toggleNav = {
    init: function(element, valueAccessor) {
        var wrapper = ko.unwrap(valueAccessor());
        $(element).on('click', function() {
            $(wrapper).toggleClass("show-nav");
        });

        onDispose(element, function() {
            $(element).off('click')
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
    init: function(element, valueAccessor, allBindings) {
        let options = ko.unwrap(valueAccessor());
        $(element).css({
            height: `${$(element).outerHeight()}px`,
        });

        Ps.initialize(element, options);
        onDispose(element, function() {
            Ps.destroy(element);
        })
    },
    update: function(element, valueAccessor) {
        $(element).css({
            height: `${$(element).outerHeight()}px`,
        });
        Ps.update(element);
    }
}

ko.bindingHandlers.scrollEnd = {
    init: function(element, valueAccessor) {

        let observable = valueAccessor();

        $(element).on('scroll', function() {
            let scrollTop = $(element).scrollTop() //how much has been scrolled
            let height = $(element).innerHeight() // inner height of the element
            let scrollHeight = element.scrollHeight;
            if (scrollTop + height >= scrollHeight) {
                console.log(scrollTop, height, scrollHeight);
                observable(true);
            } else {
                observable(false);
            }
        })
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

ko.bindingHandlers.isFavorite = {
    update: function(element, valueAccessor) {
        let isFavorite = ko.unwrap(valueAccessor());

        if (isFavorite) {
            $(element).text("star");
        } else {
            $(element).text("star_border");
        }
    }
}

ko.bindingHandlers.visibility = {
    update: function(element, valueAccessor) {
        let isVisible = ko.unwrap(valueAccessor());

        if (isVisible) {
            $(element).css("visibility", "visible");
        } else {
            $(element).css("visibility", "hidden");
        }
    }
}


ko.bindingHandlers.onEnter = {
    init: function(element, valueAccessor, allBindngs, viewModel) {

        $("body").on('keyup', function(event) {
            let isEnterKey = event.keyCode === '13';
            let execute = ko.unwrap(valueAccessor());
            if (isEnterKey) {
                execute.call(viewModel);
            }
        })
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

        onDispose(element, function() {
            $(element).material_select('destroy');

        });
    },
    update: function(element, valueAccessor, allBindings) {
        let value = ko.unwrap(valueAccessor());
        console.log("ko.bindingHandlers.materialSelect::update - value", value);
        $(element).material_select();
    }
}

ko.bindingHandlers.src = {
    update: function(element, valueAccessor, allBindings) {
        let src = ko.unwrap(valueAccessor());
        let isScrollTop = ko.unwrap(allBindings.get('scrollTopOnClick'));
        $(element).attr('src', src);
        if (isScrollTop) {
            $(".content").scrollTop(0);
        }
    }
}

ko.bindingHandlers.tooltip = {
    init: function(element, valueAccessor, allBindings) {
        let position = ko.unwrap(valueAccessor());
        let text = allBindings.get('text');
        $(element).on('mouseenter', function() {
            $(element).attr('data-tooltip', text);
            $(element).tooltip({
                delay: 50,
                position: position
            });
            $(element).trigger('mouseenter.tooltip')
        });

        $(element).on('mouseout', function() {
            $(element).tooltip('remove');
        });

        onDispose(element, function(element) {
            $(element).tooltip('remove');
        })
    }
}

ko.bindingHandlers.singlePulseEffect = {
    init: function(element, valueAccessor) {

        let $element = $(element);
        $element.addClass("cbutton cbutton--effect-boris")
        $element.find("material-icons").addClass("cbutton__icon")
        $element.on('click', function() {
            console.log("single pulse click")
            $element.addClass('cbutton--click');
            $element.on('animationend', function() {
                $element.off('animationend');
                $element.removeClass('cbutton--click');
            });
        })

        onDispose(element, function() {
            console.log("onDispose", "singlePulseEffect");
            $element.off("click");
        });
    }
}

ko.bindingHandlers.scale = {
    update: function(element, valueAccessor, allBindings) {
        let scale = ko.unwrap(valueAccessor());
        $(element).css('transform', `scale(${scale})`);
    }
}


ko.bindingHandlers.switch = {
    init: function(element, valueAccessor) {
        let isOn = valueAccessor();
        $(element).on('change', function() {
            let value = $(element).prop('checked');
            console.log("switch.changed", value);
            isOn(value);
        });
        onDispose(element, function() {
            $(element).off('change');
        });
    },
    update: function(element, valueAccessor, allBindings) {
        let value = ko.unwrap(valueAccessor());
        // console.log("ko.bindingHandlers.materialSelect::update - value", value, $(element).val());
        if (value) {
            $(element).prop('checked', true);
        } else {
            $(element).prop('checked', false);
        }

        // $(element).trigger('change');
    }
}


ko.bindingHandlers.keybind = {
    init: function(element, valueAccessor) {
        let key = valueAccessor();
        let $element = $(element);
        let $input = $element.find('.settings-input');
        let $label = $element.find('.settings-label');

        function keyPressHandler(event) {
            event.preventDefault();
            let combo = "";
            let alt = event.altKey ? "ALT" : null;
            let shiftKey = event.shiftKey ? "SHIFT" : null;
            let ctrlKey = event.ctrlKey ? "CTRL" : null;
            let hasModfiers = !ctrlKey || !alt || !shiftKey;
            let letter = "";
            console.log(event.key);
            console.log(event.keyCode);
            if (!_.includes([16, 17, 18, 91], event.keyCode)) {
                letter = String.fromCharCode(event.keyCode);
            }
            if (_.includes([37, 38, 39, 40], event.keyCode)) {
                switch (event.keyCode) {
                    case 37:
                        letter = "LEFT ARROW";
                        break;
                    case 38:
                        letter = "UP ARROW";
                        break;
                    case 39:
                        letter = "RIGHT ARROW";
                        break;
                    case 40:
                        letter = "DOWN ARROW";
                        break;
                }
            }
            if (letter) {
                let text = _.without([ctrlKey, alt, shiftKey, letter], null).join(" + ");
                console.log(letter);;
                key(text);

            }

            return false;
        }

        function clickHandler(event) {
            key("LEFT CLICK");
        }

        $element.on('click', function() {
            $element.removeClass("btn-flat").addClass("btn");
            $element.find('.settings-label').hide();
            $input.show();
            $input.trigger('focus');
            $input.on("keydown", keyPressHandler);
            $input.on("click", clickHandler);
            $input.on("blur", function() {
                $input.off("keydown", keyPressHandler);
                $element.removeClass("btn").addClass("btn-flat");
                $input.hide();
                $element.find('.settings-label').show();
            });

        });

        onDispose(element, function() {
            $element.off('click');
            $input.off('keydown');
        })
    }
}

ko.bindingHandlers.listenTo = {
    init: function(element, valueAccessor) {
        let commands = ko.unwrap(valueAccessor());
        console.log("custom-bindings::listenTo::init");

        function keyPressHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            let combo = "";
            let alt = event.altKey ? "ALT" : null;
            let shiftKey = event.shiftKey ? "SHIFT" : null;
            let ctrlKey = event.ctrlKey ? "CTRL" : null;
            let hasModfiers = !ctrlKey || !alt || !shiftKey;
            let letter = "";
            console.log(event.key);
            if (!_.includes([16, 17, 18, 91], event.keyCode)) {
                letter = String.fromCharCode(event.keyCode);
            }
            if (_.includes([37, 38, 39, 40], event.keyCode)) {
                switch (event.keyCode) {
                    case 37:
                        letter = "LEFT ARROW";
                        break;
                    case 38:
                        letter = "UP ARROW";
                        break;
                    case 39:
                        letter = "RIGHT ARROW";
                        break;
                    case 40:
                        letter = "DOWN ARROW";
                        break;
                }
            }
            if (letter) {
                let input = _.without([ctrlKey, alt, shiftKey, letter], null).join(" + ");
                $("body").trigger("command", input);
            }
            console.log("on key up")
            return false;
        }

        function clickHandler(event) {
            key("LEFT CLICK");
        }

        $("body").on("keyup", keyPressHandler)
        $("body").on("command", function(event, input) {
            let command = _.find(commands, {
                hotkey: input
            });
            if (command) {

                command.execute()
                console.log("should execute command");
            }
        })

        onDispose(element, function() {
            $("body").on("keyup", keyPressHandler);
            $("body").off("command");
        })
    }
}
