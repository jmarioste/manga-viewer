const _ = require('lodash');
const Zip = require('adm-zip');
const Promise = require('bluebird');
const sharp = require('sharp');
const rarfile = require('rarfile');
const path = require('path');
module.exports = function(input, done) {

    let filePath = input.folderPath;
    let start = input.start;
    let end = input.end;
    let appPath = input.appPath;
    let ext = path.extname(filePath).toLowerCase();
    let isZip = ext.indexOf(".zip") >= 0;
    let isRar = ext.indexOf(".rar") >= 0;
    console.log("get-pages-thread", filePath, start, end);

    function getPages(zip, entry) {
        return new Promise(function(resolve, reject) {
            console.log('entry', entry.name);
            zip.readAsTextAsync(entry, function(base64_image) {
                resolve(`data:image/bmp;base64,${base64_image}`);
            }, 'base64');
        });
    };

    function getPagesRar(rf, file) {
        console.log("pages.worker.js::getPagesRar");
        return new Promise(function(resolve, reject) {
            rf.readFile(file, function(err, data) {
                if (err) {
                    reject(err);
                    console.log("getPages rar", err);
                } else {
                    let str = data.toString('base64')
                    resolve(`data:image/bmp;base64,${str}`);
                }

                rf = null;
            });
        })
    }
    if (isZip) {
        let zip = new Zip(filePath);
        let entries = _(zip.getEntries()).sortBy('name').slice(start, end).value();

        if (zip) {
            Promise.map(entries, function(entry) {
                return getPages(zip, entry);
            }).then(function(pages) {
                done(pages);
            });
        }
    } else if (isRar) {
        let rf;
        try {
            rf = new rarfile.RarFile(filePath, {
                rarTool: path.join(appPath, "UnRAR.exe")
            });
        } catch (e) {
            console.log("thumbnail error", e);
            done([]);
            return;
        }

        if (rf) {
            rf._loadNames().then(function(names) {
                let files = names.split("\r\n");
                let imageRegex = /(\.jpg$|\.png$)/i;
                let images = files.filter(file => imageRegex.test(file))
                    .sort()
                    .slice(start, end);
                console.log("images", files.filter(file => imageRegex.test(file)));
                Promise.map(images, function(image) {
                    return getPagesRar(rf, image);
                }).then(function(pages) {
                    done(pages);
                });
            })
        }
    }



}
