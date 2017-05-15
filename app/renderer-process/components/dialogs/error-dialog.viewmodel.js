import ko from "knockout";
import template from "./error-dialog.template.html";

export class ErrorDialog {
    constructor() {
        this.shown = ko.observable();
        this.errorMessage = ko.observable();
    }

    showMessage(message) {
        this.errorMessage(message);
        this.shown(true);
    }

    static registerComponent() {
        ko.components.register("error-dialog", {
            viewModel: {
                instance: errorDialogInstance
            },
            template: template
        });
    }
}
export const errorDialogInstance = new ErrorDialog();
ErrorDialog.registerComponent();

