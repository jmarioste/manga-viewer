import ko from "knockout";
import _ from "lodash";
ko.bindingHandlers.scrollEnd = {
    init: function(element, valueAccessor) {
        let $element = $(element);
        let observable = valueAccessor();

        $element.on('scroll', function() {
            let scrollTop = $element.scrollTop() //how much has been scrolled
            let height = $element.innerHeight() // inner height of the element
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
