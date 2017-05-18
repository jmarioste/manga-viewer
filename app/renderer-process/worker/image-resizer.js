var Clipper = require('image-clipper');
var logger = require('electron-log');
import { ipcRenderer } from "electron";
console.log(Clipper)
export class ImageResizer {
    constructor() {

    }
    resize(path, width = 250, height = null) {
        logger.debug(`ImageResizer.resize ${path}`)
        // document.getElementById("sample-image").src = path;

        return new Promise((resolve, reject) => {
            var source = new Image();
            source.onload = function name(params) {
                Clipper(source, function () {
                    logger.debug(width, height);
                    this.resize(width)
                        .toDataURL(function (url) {
                            logger.debug(`${path} is resized`)
                            document.getElementById("sample-image").src = url;
                            resolve();
                        });
                });
            }
            source.src = path;
        });
    }
}

export const imageResizerInstance = new ImageResizer();



ipcRenderer.on("resizeImage", function (event, path) {
    logger.debug('ipcRender.resizeImage');
    imageResizerInstance.resize(path);
})