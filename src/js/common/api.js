const ipc = window.require('electron').ipcRenderer

import $ from "jquery";
import fs from "fs";
import path from "path";
import _ from "lodash";

export default class api {
    constructor() {

    }

    static getSubFolders(folderDirectory, isOpen) {
        console.log("api::getSubFolders");
        let deferred = $.Deferred();
        console.log(folderDirectory);
        var folders = []
        fs.readdir(folderDirectory, {}, function(err, files) {

            files.forEach(function(folderName) {
                let folderPath = path.resolve(folderDirectory, folderName);
                let stat = fs.lstatSync(folderPath);
                if (stat.isDirectory()) {
                    folders.push({
                        folderName,
                        folderPath
                    })
                }
            });

            deferred.resolve({
                folders
            })
        });

        return deferred.promise();
    }

    static getMangaList(folderPath) {
        console.log("api::getMangaList", folderPath);
        let deferred = $.Deferred();
        var mangas = [];
        fs.readdir(folderPath, {}, function(err, files) {

            files.forEach(function(file) {
                let filePath = path.resolve(folderPath, file);
                let stat = fs.lstatSync(filePath);
                if (stat.isFile()) {
                    mangas.push({
                        mangaTitle: file,
                        folderPath: filePath
                    })
                }
            });

            deferred.resolve({
                mangas: mangas
            })
        });
        return deferred.promise();
    }

    static getFavoritesList() {
        let deferred = $.Deferred();
        return deferred.promise();
    }

    static getSavedSettings() {
        let deferred = $.Deferred();

        if (!api.appSettings) {
            var defaults = {
                currentFolder: "",
                bookmarks: []
            }
            ipc.send("get-saved-settings");
            ipc.on("get-saved-settings-response", function(event, data) {

                api.appSettings = data ? data : defaults;
                console.log("app-settings", api.appSettings, data);
                deferred.resolve(api.appSettings);
            });

        } else {
            deferrd.resolve(api.appSettings);
        }

        return deferred.promise();

    }

    static writeSettings(settings) {
        _.extend(api.appSettings, settings);

        ipc.send("save-settings", api.appSettings);
        ipc.on("post-saved-settings-response", function(event, data) {
            console.log("app-settings", data);
        });
    }
}