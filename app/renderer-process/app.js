import "renderer-process/scss/master.scss";

import $ from "jquery";
import ko from "knockout";
import { ipcRenderer } from "electron";

import "materialize-css";
import "renderer-process/custom-bindings";
import "renderer-process/components";

import api from "renderer-process/common/api.js";
import ViewModel from "renderer-process/models/main.viewmodel.js";
import Pages from "renderer-process/common/pages.enum";
import logger from "electron-log";




logger.info("app");
$(document).ready(function () {
    console.log("document.ready");

    api.getSavedSettings().then(function (settings) {
        logger.info("Check if app is initialized from associated files");
        let folderPath = ipcRenderer.sendSync('get-file-data');
        if (folderPath) {
            settings.selectedMangaPath = folderPath;
            settings.currentPage = Pages.ViewManga
        }

        logger.info("applyBindings.ready");
        ko.applyBindings(new ViewModel(settings));
        logger.info("applyBindings.done");



    });
});
