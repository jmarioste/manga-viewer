import ko from "knockout";
import template from "./confirm-dialog.template.html";
import { autoUpdater } from "renderer-process/common/auto-updater";
import logger from "electron-log";
export class InstallConfirm {
    constructor() {
        this.shown = ko.observable();
        this.headerMessage = ko.observable("Updates are ready to install");
        this.confirmMessage = ko.observable("Do you want to install the updates and restart the app now?");
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
        autoUpdater.installUpdates();
    }

    static registerComponent() {
        ko.components.register("install-confirm-dialog", {
            viewModel: {
                instance: installConfirm
            },
            template: template
        });
    }
}

export const installConfirm = new InstallConfirm();
InstallConfirm.registerComponent();

