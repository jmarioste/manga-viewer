const Promise = require('bluebird');

const Regex = require('../../common/regex');
const Errors = require('../../common/errors');


class ZipHandler {
    constructor(manga, yauzl){
        this.manga = manga;
        this.yauzl = yauzl;
        this.yauzlOptions = {
            lazyEntries: true
        }
    }  

    initialize(){
        let absolutePath = this.manga.folderPath;
        let options = this.yauzlOptions;
        return new Promise((resolve, reject) => {
            this.yauzl.open(absolutePath, (err, zip) => {
                if(err){
                    reject(`ZipHandler.initalize ${err}`)
                } else { 
                    resolve(zip);
                }
            })
        });
    }

    getFilenames() {
    }
} 


module.exports = ZipHandler;