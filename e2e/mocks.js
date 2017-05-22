const path = require('path')
const fixtureDir = path.join(__dirname, 'Sample Mangas');

module.exports = function (dialog) {
    dialog.showOpenDialog = (mainWindow, options, cb) => {
        cb([fixtureDir]);
    };
};
