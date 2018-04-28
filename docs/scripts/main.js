let vm = {
    downloadButtons: [
        {
            label: "Download for mac",
            platform: "mac",
            href: "https://github.com/jmarioste/manga-viewer/releases/download/v1.1.0/baiji-manga-viewer-1.1.0.dmg"
        },
        {
            label: "Download for windows",
            platform: "win",
            href: "https://github.com/jmarioste/manga-viewer/releases/download/v1.1.0/baiji-manga-viewer-setup-1.1.0.exe"
        },
        {
            label: "Download for linux",
            platform: "linux",
            href: "https://github.com/jmarioste/manga-viewer/releases/download/v1.1.0/baiji-manga-viewer-1.1.0-x86_64.AppImage"
        }
    ]
};
$(document).ready(function () {
    $('.loading').delay(500).fadeOut(500);
    $('.carousel').carousel()
    $('.do-magnifiy').magnificPopup({ type: 'image' });

    fetch('https://github.com/jmarioste/manga-viewer/releases')
        .then(function (data) {
            console.log(data);
        }).catch(function () {
            console.log("nothing happend");
        })
    ko.applyBindings(vm, $("body")[0]);
})