import * as $ from "jquery";
import * as fs from "fs";
import * as path from "path";
export let api = {
    getSubFolders: function(folderPath, isOpen) {
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
    },
    getMangaList: function(folderPath) {
        let deferred = $.Deferred();
        return deferred.promise();
    },
    getFavoritesList: function() {
        let deferred = $.Deferred();
        return deferred.promise();
    }
};