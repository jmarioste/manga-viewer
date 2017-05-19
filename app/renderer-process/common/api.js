
import $ from "jquery";
import fs from "fs";
import _ from "lodash";
import { ipcRenderer as ipc } from "electron";
import MangaFactory from "./manga.factory";
import { errorDialogInstance, ErrorDialog } from "renderer-process/components";
import logger from "electron-log";

ipc.on("auto-update-message", function (event, message) {
    Materialize.toast(message, 2000);
})

export default class api {
    constructor() {

    }
    static checkForUpdates() {
        ipc.send('check-for-updates');
    }
    static getSubFolders(folderPath) {
        console.log("api::getSubFolders - folderPath", folderPath);
        let deferred = $.Deferred();
        ipc.send('get-subfolders', folderPath);
        ipc.on('get-subfolders-done', function (event, folders) {
            console.log("api::getSubFolders", folders.length);
            deferred.resolve({
                folders: folders
            });
        });

        return deferred.promise();
    }

    static getMangaList(rootFolder, isRecursive, searchValue, pagination) {
        console.log("api::getMangaList - rootFolder", rootFolder,
            "isRecursive", isRecursive,
            "searchValue:", searchValue);

        ipc.send('get-manga-list', {
            rootFolder,
            isRecursive,
            searchValue,
            pagination
        });
    }

    static getPages(start, end, folderPath) {
        console.log("api::getPages - rootFolder", start, end, folderPath);

        let deferred = $.Deferred();

        ipc.send('get-pages', { start, end, folderPath });

        ipc.once('get-pages-done', function (event, pages) {
            logger.debug(`get-pages-done ${pages.length}`);
            deferred.resolve(pages);
        });
        ipc.once('get-pages-error', function (event, errorMessage) {
            logger.debug(`get-pages-error ${errorMessage}`);
            errorDialogInstance.showMessage(errorMessage);
            deferred.reject(errorMessage);
        });
        return deferred.promise();
    }

    static getFavorites(folderPaths) {
        ipc.send('get-favorites-list', folderPaths);
    }

    static getManga(folderPath) {
        let deferred = $.Deferred();
        ipc.send('get-manga', folderPath);
        ipc.once('get-manga-done', function (event, manga) {
            console.log("get-manga-done")
            deferred.resolve(manga);
        });
        ipc.once('get-manga-error', function (event, errorMessage) {
            console.log("api::getSubFolders", errorMessage);
            errorDialogInstance.showMessage(errorMessage);
            deferred.reject(errorMessage);
        });
        return deferred.promise();
    }
    static getSavedSettings() {
        console.log("api.getSavedSettings");
        let deferred = $.Deferred();

        if (!api.getSavedSettings.called) {
            api.getSavedSettings.called = true;
            let value = localStorage.getItem('settings');
            let settings = JSON.parse(value || "{}");
            api.appSettings = settings;
            deferred.resolve(api.appSettings);
        } else {
            deferred.resolve(api.appSettings);
        }

        return deferred.promise();

    }

    static writeSettings(settings) {
        _.extend(api.appSettings, settings);
        let str = JSON.stringify(api.appSettings || {});
        localStorage.setItem('settings', str);
    }

    static selectDirectory() {
        let deferred = $.Deferred();
        ipc.send('select-directory');
        ipc.once('select-directory-done', function (event, data) {
            console.log("select-directory done", data);
            deferred.resolve(data);
        });

        return deferred.promise();
    }
}

api.appSettings = {
    currentFolder: "",
    bookmarks: [],
    favorites: []
}
