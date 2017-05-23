const Application = require('spectron').Application;
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai');
const path = require('path');
const rimraf = require('rimraf');

chai.should();

const expect = chai.expect;
chai.use(chaiAsPromised);

module.exports = (function () {
    var setup = {};
    setup.getAppPath = function () {
        return path.join(__dirname, '..', './app');
    }

    setup.removeAppData = function () {
        return new Promise((resolve) => {
            rimraf(path.resolve(__dirname, "..", "e2e/data"), resolve);
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

        return setup.app.start()
    }

    setup.stopApp = function () {
        if (setup.app && setup.app.isRunning()) {
            setup.app.client.getMainProcessLogs().then(function (logs) {
                logs.forEach(function (log) {
                    console.log(log)
                })
            })

            return setup.app.stop()
        }
    }
    return setup;
})();