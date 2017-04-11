const ipc = window.require('electron').ipcRenderer

import $ from "jquery";
import fs from "fs";
import path from "path";
import _ from "lodash";

export default class api {
    constructor() {

    }

    static getSubFolders(folderPath) {
        console.log("api::getSubFolders,", folderPath);
        let deferred = $.Deferred();
        ipc.send('get-subfolders', folderPath);
        ipc.on('get-subfolders-done', function (event, folders) {
            console.log(folders);
            deferred.resolve({folders: folders});
        });

        return deferred.promise();
    }

    static getMangaList(rootFolder, isRecursive, searchValue) {
        console.log("api::getMangaList", rootFolder);
        let deferred = $.Deferred();

        ipc.send('get-manga-list', {
            rootFolder,
            isRecursive,
            searchValue
        });
        ipc.once('get-manga-list-done', function (event, mangas) {
            console.log('get-manga-list-done', mangas);
            deferred.resolve({mangas: mangas});
        });
        return deferred.promise();
    }


    static getSavedSettings() {
        let deferred = $.Deferred();

        if (!api.appSettings) {
            var defaults = {
                currentFolder: "",
                bookmarks: []
            }
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

    static selectDirectory(){
        let deferred = $.Deferred();
        ipc.send('select-directory');
        ipc.once('select-directory-done', function (event, data) {
            console.log("select-directory done", data);
            deferred.resolve(data);
        });

        return deferred.promise();
    }
}
