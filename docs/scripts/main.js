// import "../css/bootstrap.min.css";
// import "../css/fontawesome-all.min.css";
// import "../css/magnific-popup.css";
// import "../css/responsive.css";
// import "../css/style.css";

// vendor
import jquery from "jQuery";
import ko from "knockout";
import "popper.js";
import "magnific-popup";
import "bootstrap";

import "./ko.custom-bindings";
import metadata from "./metadata.json";

let vm = {
    version: "v1.2.2",
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
    $('.do-magnifiy').magnificPopup({ type: 'image' });
    const data = metadata[0];
    vm.version = data.name;
    vm.downloads.dmg = vm.getUrl(data.assets, /.dmg$/g);
    vm.downloads.exe = vm.getUrl(data.assets, /.exe$/g);
    vm.downloads.deb = vm.getUrl(data.assets, /.deb$/g);
    vm.downloads.AppImage = vm.getUrl(data.assets, /.AppImage$/g);
    vm.downloads.zip = vm.getUrl(data.assets, /.zip$/g);
    console.log(vm.getDownloadCount(data.assets));


    ko.applyBindings(vm, $("body")[0]);
})