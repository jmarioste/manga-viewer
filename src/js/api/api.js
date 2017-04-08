import * as $ from "jquery";
export let api = {
    getSidebarFolderListOf: function(folderPath) {
        let deferred = $.Deferred();
        deferred.resolve({
            folders: [{
                folderName: "Documents",
                lastModified: Date.now(),
                isOpen: true,
                children: [{
                    folderName: "Pictures",
                    lastModified: Date.now(),
                    isOpen: false,

                    children: []
                }, {
                    folderName: "Stuff",
                    lastModified: Date.now(),
                    isOpen: false,

                    children: [{
                        folderName: "One Piece",
                        lastModified: Date.now(),
                        isOpen: false,
                        children: []
                    }]
                }]
            }]
        });

        return deferred.promise();
    },
    getMangaList: function(folderPath) {
        let deferred = $.Deferred();
        return deferred.promise();
    }
};