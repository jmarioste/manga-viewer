import ko from "knockout";
import template from "./confirm-dialog.template.html";
import { autoUpdater } from "renderer-process/common/auto-updater";
import logger from "electron-log";
export class UpdateConfirmationDialog {
    constructor() {
        this.shown = ko.observable();
        this.headerMessage = ko.observable("Updates are available");
        this.confirmMessage = ko.observable("Do you want to download the updates now?");
        this.onComplete = this.onComplete.bind(this);
        this.confirmed = ko.observable(false);
    }

    show() {
        this.confirmed(false);
        this.shown(true);
    }

    onComplete() {
        this.shown(false);
    }

    clickConfirm() {
        logger.info("Yes was clicked.");
        this.confirmed(true);
        autoUpdater.downloadUpdates();
    }

    static registerComponent() {
        ko.components.register("update-confirmation-dialog", {
            viewModel: {
                instance: updateConfirmationDialog
            },
            template: template
        });
    }
}

export const updateConfirmationDialog = new UpdateConfirmationDialog();
UpdateConfirmationDialog.registerComponent();

