const ipc = window.require('electron').ipcRenderer

import $ from "jquery";
import fs from "fs";
import path from "path";
import _ from "lodash";

export default class api {
    constructor() {

    }

    static getSubFolders(folderPath, isOpen) {
        console.log("api::getSubFolders");
        let deferred = $.Deferred();

        var dirs = []
        fs.readdir(folderPath, {}, function(err, files) {

            files.forEach(function(file) {
                let filePath = path.resolve(folderPath, file);
                let stat = fs.lstatSync(filePath);
                if (stat.isDirectory()) {
                    dirs.push({
                        folderName: file,
                        folderPath: filePath,
                        isOpen: false,
                        children: []
                    })
                }
            });

            deferred.resolve({
                folders: dirs
            })
        });

        return deferred.promise();
    }

    static getMangaList(folderPath) {
        console.log("api::getMangaList", folderPath);
        let deferred = $.Deferred();
        var mangas = [];
        var id = 0;
        fs.readdir(folderPath, {}, function(err, files) {

            files.forEach(function(file) {
                let filePath = path.resolve(folderPath, file);
                let stat = fs.lstatSync(filePath);
                if (stat.isFile()) {
                    mangas.push({
                        id: id++,
                        mangaTitle: file,
                        folderPath: filePath,
                        // isOpen: false,
                        // children: []
                        author: "",
                        circle: "",
                        tags: [],
                        isFavorites: false,
                        thumbnailImage: null
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