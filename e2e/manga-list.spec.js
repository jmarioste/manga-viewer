const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('Manga List', function () {
    this.timeout(30000)
    before(function () {
        return setup.removeAppData();
    });

    beforeEach(setup.initApp);

    afterEach(setup.stopApp)

    describe(`if there's no selected directory`, function () {
        it('the label for page should be Manga list', function () {
            return setup.app.client
                .waitUntilWindowLoaded(10000)
                .windowByIndex(1)
                .getText("#selected-directory-text").then(function (text) {
                    expect(text).to.equal("Manga list");
                })
        });
    });

    describe(`if user select's Sample Manga as directory`, function () {
        it('the label should change to Sample Mangas', function () {
            return setup.app.client
                .waitUntilWindowLoaded(10000)
                .windowByIndex(1)
                .click("#select-directory-btn")
                .pause(500)
                .getText("#selected-directory-text").then(function (text) {
                    expect(text).to.equal("Sample Mangas")
                })
        });
    });

    describe(`When searching manga`, () => {

        describe('When searching a manga the does not exists', () => {

            it('the list should be empty', () => {
                return setup.app.client
                    .waitUntilWindowLoaded(10000)
                    .windowByIndex(1)
                    .waitForVisible("#mangalist > .manga", 10000)
                    .click("#search")
                    .setValue("#search", "this-manga-does-not-exist.zip")
                    .click("#selected-directory-text")
                    .pause(1000)
                    .waitForVisible(".progress", 1000, true)
                    .isVisible("#mangalist > .manga").should.eventually.be.false
            });
        });


        describe('When searching mangas that exists', () => {
            it('the list should display the correct mangas', () => {
                return setup.app.client
                    .waitUntilWindowLoaded(1000)
                    .windowByIndex(1)
                    .click("#search")
                    .setValue("#search", "sample")
                    .waitForVisible(".progress", 10000, true)
                    .click("#selected-directory-text")
                    .pause(1000)
                    .waitForVisible(".progress", 10000, true)
                    .isExisting("#mangalist > .manga").should.eventually.be.true
            });
        });
    })

    describe('When include subfolders is clicked', () => {

        it('Should display all the mangas recursively', () => {
            return setup.app.client
                .waitUntilWindowLoaded(10000)
                .windowByIndex(1)
                .waitForVisible(".progress", 10000, true)
                .click(".include-subfolders > label.right")
                .pause(1000)
                .waitForVisible(".progress", 10000, true)
                .elements("#mangalist > .manga").then(function (result) {
                    expect(result.value.length).to.equal(2);
                })
        });

    })
})
