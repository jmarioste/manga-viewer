const Application = require('spectron').Application;
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai');
const path = require('path');
const rimraf = require('rimraf');
const customCommands = require('./commands/custom-commands.js');
chai.should();

const expect = chai.expect;
chai.use(chaiAsPromised);

//not really setup. more like a helper class;
module.exports = (function () {
    var setup = {};
    setup.getAppPath = function () {
        return path.join(__dirname, '..', './app');
    }

    setup.removeAppData = function () {
        return new Promise((resolve) => {
            rimraf(path.resolve(setup.getAppPath(), ".data"), resolve);
        });
    }

    setup.getElectronPath = function () {
        let electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');

        if (process.platform == 'win32') {
            electronPath += '.cmd';
        }
        return electronPath;
    }

    setup.initApp = function () {
        const mocksPath = path.join(__dirname, 'mocks.js');
        setup.app = new Application({
            path: setup.getElectronPath(),
            env: { SPECTRON: true },
            args: [
                setup.getAppPath(), '-r',
                mocksPath
            ],
            waitTimeout: 10000
        });

        chaiAsPromised.transferPromiseness = setup.app.transferPromiseness
        return setup.app.start().then(function () {
            customCommands(setup.app.client)
            return setup.app.client.initWindow();
        });
    }

    setup.showLogsIfTestFailed = function (_this) {
        if (_this.currentTest.state === 'failed') {
            setup.app.client.getMainProcessLogs().then(function (logs) {
                logs.forEach(console.log);
            })
        }
    }

    setup.stopApp = function () {
        if (setup.app && setup.app.isRunning()) {
            setup.showLogsIfTestFailed(this);
            return setup.app.stop()
        }
    }
    return setup;
})();