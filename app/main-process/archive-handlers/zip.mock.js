class Zip {
    constructor(fileList) {
        this.fileList = fileList;
        this.index = 0;
        this.entryHandlers = [];
        this.endHandlers = [];
        this.errorHandlers = [];
    }

    readEntry(err) {
        if (err) {
            this.errorHandlers.forEach(cb => cb(err));
        } else if (this.index < this.fileList.length) {
            setTimeout(() => {
                let entry = this.fileList[this.index];
                this.index++;
                this.entryHandlers.forEach(cb => cb(entry));
            }, 0);
        } else {
            this.endHandlers.forEach(cb => cb())
        }


    }

    on(event, cb) {
        switch (event) {
            case 'entry':
                this.entryHandlers.push(cb);
                break;
            case 'end':
                this.endHandlers.push(cb);
                break;
            case 'error':
                this.errorHandlers.push(cb);
            default:
                break;
        }
    }

    close() {
        this.index = 0;
    }

    openReadStream(file, cb) {
        setTimeout(() => {
            let readStream = {};
            cb(null, readStream);
        })
    }
}

module.exports = Zip;