var Clipper = require('image-clipper');
var logger = require('electron-log');

class ImageResizer {
    constructor() {

    }
    resize(path, width = 250, height = null) {
        logger.debug(`ImageResizer.resize ${path}`)
        // document.getElementById("sample-image").src = path;

        return new Promise((resolve, reject) => {
            var source = new Image();
            source.onload = function name(params) {
                Clipper(source, function () {
                    logger.debug(width, height, this);
                    try {
                        this.resize(width)
                            .toFile(path, function () {
                                resolve();
                            });
                    } catch (e) {
                        throw e;
                    }

                });
            }
            source.src = path;
        });
    }
}
exports.ImageResizer = ImageResizer;
exports.imageResizerInstance = new ImageResizer();
