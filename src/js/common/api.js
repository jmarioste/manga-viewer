const ipc = window.require('electron').ipcRenderer

import $ from "jquery";
import fs from "fs";
import _ from "lodash";

import MangaFactory from "./manga.factory";

export default class api {
    constructor() {

    }

    static getSubFolders(folderPath) {
        console.log("api::getSubFolders - folderPath", folderPath);
        let deferred = $.Deferred();
        ipc.send('get-subfolders', folderPath);
        ipc.on('get-subfolders-done', function(event, folders) {
            console.log("api::getSubFolders", folders.length);
            deferred.resolve({
                folders: folders
            });
        });

        return deferred.promise();
    }

    static getMangaList(rootFolder, isRecursive, searchValue) {
        console.log("api::getMangaList - rootFolder", rootFolder,
            "isRecursive", isRecursive,
            "searchValue:", searchValue);

        let deferred = $.Deferred();

        ipc.send('get-manga-list', {
            rootFolder,
            isRecursive,
            searchValue
        });
        ipc.once('get-manga-list-done', function(event, mangas) {
            deferred.resolve({
                mangas
            });
        });
        return deferred.promise();
    }

    static getPages(start, end, folderPath) {
        console.log("api::getPages - rootFolder", start, end, folderPath);

        let deferred = $.Deferred();

        ipc.send('get-pages', {
            start,
            end,
            folderPath
        });

        ipc.once('get-pages-done', function(event, pages) {
            console.log("get-pages-done")
            deferred.resolve(pages);
        });
        return deferred.promise();
    }

    static getFavorites(folderPaths) {
        let deferred = $.Deferred();

        ipc.send('get-favorites-list', folderPaths);
        ipc.once('get-favorites-list-done', function(event, mangas) {

            deferred.resolve(mangas);
        });

        return deferred.promise();
    }

    static getSavedSettings() {
        let deferred = $.Deferred();

        if (!api.getSavedSettings.called) {
            api.getSavedSettings.called = true;
            ipc.send("read-settings");
            ipc.once("read-settings-done", function(event, data) {

                api.appSettings = data ? data : defaults;
                console.log("read-settings done", api.appSettings);
                deferred.resolve(api.appSettings);
            });

        } else {
            deferrd.resolve(api.appSettings);
        }

        return deferred.promise();

    }

    static writeSettings(settings) {
        _.extend(api.appSettings, settings);

        ipc.send("set-settings", api.appSettings);
        ipc.once("set-settings-done", function(event, data) {
            console.log("set-settings done", data);
        });
    }

    static selectDirectory() {
        let deferred = $.Deferred();
        ipc.send('select-directory');
        ipc.once('select-directory-done', function(event, data) {
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
