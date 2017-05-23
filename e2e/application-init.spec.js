const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('application launch', function () {
    this.timeout(10000)

    beforeEach(setup.initApp);

    afterEach(setup.stopApp)

    it('Title bar should contain Baiji Manga Viewer', function () {
        return setup.app.client
            .waitUntilWindowLoaded(10000)
            .windowByIndex(1)
            .getText(".title-bar .app-title").should.eventually.equal("Baiji Manga Viewer")
    });
})
