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

        if(!api.appSettings){
            ipc.send("get-saved-settings");
            ipc.once("get-saved-settings-response", function (event, data) {
                api.appSettings = data;
                console.log("app-settings", data);
                deferred.resolve(data);
            });
                        
        } else {
            deferrd.resolve(api.appSettings);
        }

        return deferred.promise();
                
    }

    static writeSettings(settings){
        console.log("api:writeSettings");
        _.extend(api.appSettings, settings);
        let saveFileLocation = path.resolve(process.cwd(), "lastSave.json");
        let data = JSON.stringify(settings);
        console.log("api:writeSettings", api.appSettings);
        fs.writeFile(saveFileLocation, data, "utf-8", function (err) {
            if(err){
                throw err;
            }
            console.log("success write file")
            // event.sender.send('put-saved-settings-response', "done");
        });
        // fs.writeFile(saveFileLocation, data, "utf-8", function (err) {
        //     if(err){
        //         throw err;
        //     }
        //     event.sender.send('put-saved-settings-response', "done");
        // });
        
        // ipc.send("post-save-settings", settings);
    }
}

