import ko from "knockout";
let onDispose = ko.utils.domNodeDisposal.addDisposeCallback;
ko.bindingHandlers.listenTo = {
    init: function(element, valueAccessor, allBindings) {
        let context = allBindings.get('context') || "";
        let preventPropagation = allBindings.get('preventPropagation');
        let commands = ko.unwrap(valueAccessor());
        let $body = $("body");
        console.log("custom-bindings::listenTo::init");

        function keyPressHandler(event) {
            event.preventDefault();
            if (preventPropagation) {
                event.stopImmediatePropagation();
            }
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
                $body.trigger("command." + context, input);
            }
            console.log("on key up")
            return false;
        }

        function clickHandler(event) {
            key("LEFT CLICK");
        }

        $body.on("keyup." + context, keyPressHandler);
        $body.on("listen.pause", function() {
            $body.off("keyup." + context, keyPressHandler);
        });

        $body.on("listen.unpause", function() {
            $body.on("keyup." + context, keyPressHandler);
        });

        $body.on("command." + context, function(event, input) {
            let command = _.find(commands, {
                hotkey: input
            });
            if (command) {

                command.execute()
                console.log("should execute command");
            }
        })

        onDispose(element, function() {
            $body.off("listen.pause");
            $body.off("listen.unpause");
            $body.off("command." + context);
        })
    }
}
