const _ = require('lodash');
const Zip = require('adm-zip');
const Promise = require('bluebird');
const sharp = require('sharp');
const rarfile = require('rarfile');
const path = require('path');

function getPages(zip, entry) {
    return new Promise(function (resolve, reject) {
        console.log('entry', entry.name);
        zip.readAsTextAsync(entry, function (base64_image) {
            resolve(`data:image/bmp;base64,${base64_image}`);
        }, 'base64');
    });
};

function getPagesRar(rf, file) {
    console.log("pages.worker.js::getPagesRar");
    return new Promise(function (resolve, reject) {
        rf.readFile(file, function (err, data) {
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

exports.get = function (input) {
    console.log("get-manga-pages.worker.js");
    let filePath = input.folderPath;
    let start = input.start;
    let end = input.end;
    let appPath = input.appPath;
    let ext = path.extname(filePath).toLowerCase();
    let isZip = ext.indexOf(".zip") >= 0;
    let isRar = ext.indexOf(".rar") >= 0;
    let rf;


    if (isZip) {
        let zip = new Zip(filePath);
        let entries = _(zip.getEntries()).sortBy('name').slice(start, end).value();

        if (zip) {
            return Promise.map(entries, function (entry) {
                return getPages(zip, entry);
            });
        }
    } else if (isRar) {
        try {
            rf = new rarfile.RarFile(filePath, {
                rarTool: path.join(appPath, "UnRAR.exe")
            });
        } catch (e) {
            console.log("thumbnail error", e);
            return new Promise((resolve, reject) => reject(e));
        }

        if (rf) {
            return new Promise((resolve, reject) => {
                rf._loadNames().then(function (names) {
                    let files = names.split("\r\n");
                    let imageRegex = /(\.jpg$|\.png$)/i;
                    let images = files.filter(file => imageRegex.test(file))
                        .sort()
                        .slice(start, end);
                    Promise.map(images, function (image) {
                        return getPagesRar(rf, image);
                    }).then(resolve);
                })
            });
        }
    }
}
