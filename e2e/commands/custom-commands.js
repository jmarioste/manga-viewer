module.exports = function (client) {

    client.addCommand('initWindow', function () {
        return this.waitUntilWindowLoaded(10000)
            .windowByIndex(1)
    });

    client.addCommand('getSelectedFolderText', function () {
        return this.getText("#selected-directory-text")
    });

    client.addCommand('selectDirectorySampleManga', function () {
        return this.click("#select-directory-btn")
            .pause(500)
    })

    client.addCommand('bookmarkFolder', function () {
        return this.click(".bookmark-btn")
    });

    client.addCommand('getElementCount', function (selector) {
        return this.elements(selector).then(function (result) {
            return result.value.length;
        })
    })

    client.addCommand('searchManga', function (searchValue) {
        let search = this.element("#search");
        return this.click('#search')
            .setValue('#search', searchValue)
            .click("#selected-directory-text") //remove focus from search
            .pause(500);
    });

    client.addCommand('waitForFinishLoading', function () {
        //if progress is hidden meaning it has done loading;
        return this.waitForVisible(".progress", 10000, true);
    })
}