import ko from "knockout";
import template from "./about-dialog.template.html";
import { remote } from "electron";
export class AboutDialog {
    constructor() {
        this.shown = ko.observable();
        this.appName = ko.observable(remote.app.getName());
        this.version = ko.observable(remote.app.getVersion());
        this.githubRepo = ko.observable("https://github.com/shizkun/manga-viewer/issues");
        this.description = ko.observable("A simple manga viewer inspired by quivi.");
        this.onComplete = this.onComplete.bind(this);
    }

    showMessage(message) {
        this.errorMessage(message);
        this.shown(true);
    }
    onComplete() {
        this.shown(false);
    }
    static registerComponent() {
        ko.components.register("about-dialog", {
            viewModel: {
                instance: aboutDialogInstance
            },
            template: template
        });
    }
}
export const aboutDialogInstance = new AboutDialog();
AboutDialog.registerComponent();

