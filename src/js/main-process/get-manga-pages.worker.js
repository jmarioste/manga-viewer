module.exports = function(input, done) {
    const _ = require('lodash');
    const Zip = require('adm-zip');
    const Promise = require('bluebird');


    let filePath = input.folderPath;
    let start = input.start;
    let end = input.end
    console.log("get-pages-thread", filePath, start);
    let zip = new Zip(filePath);
    let entries = _(zip.getEntries()).sortBy('name').slice(start, end).value();

    function getPages(entry) {
        return new Promise(function(resolve, reject) {
            console.log('entry', entry.name);
            zip.readAsTextAsync(entry, function(base64_image) {
                resolve(`data:image/bmp;base64,${base64_image}`);
            }, 'base64');
        });
    };


    if (zip) {
        Promise.map(entries, getPages).then(function(pages) {
            done(pages);
        });
    }

}
