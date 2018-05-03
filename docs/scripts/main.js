let vm = {
    version: "1.2.2",
    downloads: {
        AppImage: "https://github.com/jmarioste/manga-viewer/releases/download/v1.2.2/baiji-manga-viewer-1.2.2-x86_64.AppImage",
        dmg: "https://github.com/jmarioste/manga-viewer/releases/download/v1.2.2/baiji-manga-viewer-1.2.2.dmg",
        exe: "https://github.com/jmarioste/manga-viewer/releases/download/v1.2.2/baiji-manga-viewer-setup-1.2.2.exe",
        deb: "https://github.com/jmarioste/manga-viewer/releases/download/v1.2.2/baiji-manga-viewer_1.2.2_amd64.deb",
        zip: "https://github.com/jmarioste/manga-viewer/releases/download/v1.2.2/baiji-manga-viewer-1.2.2-mac.zip"

    },

    getUrl(assets, regex) {
        var url = assets.map(asset => asset.browser_download_url)
            .filter((url) => regex.test(url));
        console.log(url);
        return url[0];
    },
    getDownloadCount(assets) {
        var stuff = assets.map(asset => asset.download_count)
        console.log(stuff);
        return stuff;
    }
};
$(document).ready(function () {
    $('.loading').delay(500).fadeOut(500);
    $('.carousel').carousel()
    $('.do-magnifiy').magnificPopup({ type: 'image' });

    // fetch('https://api.github.com/repos/jmarioste/manga-viewer/releases/latest')
    //     .then(function (response) {
    //         return response.json();
    //     }).then(function (data) {
    //         console.log(data);
    //         vm.downloadButtons[0].href = vm.getUrl(data.assets, /.dmg$/g);
    //         vm.downloadButtons[1].href = vm.getUrl(data.assets, /.exe$/g);
    //         vm.downloadButtons[2].href = vm.getUrl(data.assets, /.deb$/g);
    //         console.log(vm.getDownloadCount(data.assets));
    //         ko.applyBindings(vm, $("body")[0]);

    //     })

    // vm.downloadButtons[0].href = vm.getUrl(data.assets, /.dmg$/g);
    // vm.downloadButtons[1].href = vm.getUrl(data.assets, /.exe$/g);
    // vm.downloadButtons[2].href = vm.getUrl(data.assets, /.deb$/g);
    // .catch(function () {
    //     console.log("nothing happend");
    // })
    ko.applyBindings(vm, $("body")[0]);
})