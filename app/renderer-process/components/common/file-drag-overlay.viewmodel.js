import ko from "knockout";
import _ from "lodash";

import template from "./file-drag-overlay.template.html";

export class FileDragOverlay {
    constructor() {

    }

    static registerComponent() {
        ko.components.register("file-drag-overlay", {
            viewModel: FileDragOverlay,
            template: template,
            synchronous: false
        });
    }
}

FileDragOverlay.registerComponent();