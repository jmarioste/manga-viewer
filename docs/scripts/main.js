let vm = {
    downloadButtons: [
        {
            label: "Download for mac",
            platform: "mac",
        },
        {
            label: "Download for windows",
            platform: "win",
        },
        {
            label: "Download for linux",
            platform: "linux",
        }
    ],
    getUrl(assets, regex) {
        var url = assets.map(asset => asset.browser_download_url)
            .filter((url) => regex.test(url));
        console.log(url);
        return url[0];
    }
};
$(document).ready(function () {
    $('.loading').delay(500).fadeOut(500);
    $('.carousel').carousel()
    $('.do-magnifiy').magnificPopup({ type: 'image' });

    fetch('https://api.github.com/repos/jmarioste/manga-viewer/releases/latest')
        .then(function (response) {
            return response.json();
        }).then(function(data){
            console.log(data);
            vm.downloadButtons[0].href = vm.getUrl(data.assets, /.dmg$/g);
            vm.downloadButtons[1].href = vm.getUrl(data.assets, /.exe$/g);
            vm.downloadButtons[2].href = vm.getUrl(data.assets, /.deb$/g);
            
            ko.applyBindings(vm, $("body")[0]);
        })
           
        // .catch(function () {
        //     console.log("nothing happend");
        // })
    
})