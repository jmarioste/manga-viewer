const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('application launch', function () {
    this.timeout(10000)

    beforeEach(setup.initApp);

    afterEach(setup.stopApp)

    it('Should start 1 main window and 2 threads', function () {
        return setup.app.client.getWindowCount().then(function (count) {
            expect(count).to.equal(2);
        });
    });
})
