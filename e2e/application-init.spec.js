const Application = require('spectron').Application;
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai');
const path = require('path')
chai.should();

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('application launch', function () {
    this.timeout(10000)

    beforeEach(function () {
        console.log(__dirname);
        let electronPath = path.join(__dirname, '..', 'node_modules', '.bin', 'electron');
        if (process.platform == 'win32') {
            electronPath += '.cmd';
        }

        this.app = new Application({
            path: electronPath,
            args: [
                path.join(__dirname, '..', './app')
            ],
            waitTimeout: 10000
        })
        return this.app.start()
    })

    afterEach(function () {
        if (this.app && this.app.isRunning()) {
            return this.app.stop()
        }
    })

    it('Should start 1 main window and 2 threads', function () {
        return this.app.client.getWindowCount().then(function (count) {
            expect(count).to.equal(3);
        });
    })
})