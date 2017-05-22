const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('Manga List', function () {
    this.timeout(10000)

    beforeEach(setup.initApp);

    afterEach(setup.stopApp)

    describe(`when there's no selected directory`, function () {
        it('the label for page should be Manga list', function () {
            return setup.app.client
                .windowByIndex(1)
                .getText("#selected-directory-text").then(function (text) {
                    expect(text).to.equal("Manga list");
                })
        });
    });

    describe(`when user select's Sample Manga as directory`, function () {
        it('the label should change to Sample Mangas', function () {
            return setup.app.client
                .windowByIndex(1)
                .click("#select-directory-btn")
                .pause(500)
                .getText("#selected-directory-text").then(function (text) {
                    expect(text).to.equal("Sample Mangas")
                })
        });
    });
})
