import ko from "knockout";
import _ from "lodash";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
ko.bindingHandlers.keybind = {
    init: function(element, valueAccessor) {
        let key = valueAccessor();
        let $element = $(element);
        let $input = $element.find('.settings-input');
        let $label = $element.find('.settings-label');
        let $body = $("body");

        function keyPressHandler(event) {
            event.preventDefault();
            event.stopImmediatePropagation();
            $body.trigger('listen.pause');
            // event.stopImmediatePropagation();
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
        }

        function clickHandler(event) {
            key("LEFT CLICK");
        }

        $element.on('click', function() {
            $element.removeClass("btn-flat").addClass("btn");
            $label.hide();
            $input.show();
            $input.trigger('focus');

            $input.on("keydown", keyPressHandler);
            $input.on("click", clickHandler);
            $input.on("blur", function() {
                $input.off("keydown", keyPressHandler);
                $element.removeClass("btn").addClass("btn-flat");
                $input.hide();
                $label.show();
                $body.trigger('listen.unpause');
            });

        });

        onDispose(element, function() {
            $element.off('click');
            $input.off('keydown');
        })
    }
}
