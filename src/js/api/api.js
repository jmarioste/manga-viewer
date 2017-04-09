import $ from "jquery";
import fs from "fs";
import path from "path";

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
                        // folderPath: filePath,
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
}