const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('Manga List', function () {
    this.timeout(30000)
    before(function () {
        // console.log(browser);
        return setup.removeAppData();
    });

    beforeEach(setup.initApp);

    afterEach(setup.stopApp)

    describe(`if there's no selected directory`, function () {
        it('the label for page should be Manga list', function () {
            return setup.app.client
                .getSelectedFolderText().should.eventually.equal("Manga list");
        });
    });

    describe(`if user select's Sample Manga as directory`, function () {
        it('the label should change to Sample Mangas', function () {
            return setup.app.client
                .selectDirectorySampleManga()
                .getText("#selected-directory-text").should.eventually.equal("Sample Mangas");
        });
    });

    describe(`When bookmarking a folder`, function () {
        it('it should be added under bookmarked folders in sidebar', function () {
            return setup.app.client
                .bookmarkFolder()
                .pause(500)
                .elements(".sidebar-favorites-items .collection-item")
                .then(function (results) {
                    expect(results.value.length).to.equal(1);
                })
        });
    });

    describe(`When unbookmarking a folder`, function () {
        it('it should be removed from bookmarked folders', function () {
            return setup.app.client
                .bookmarkFolder()
                .pause(500)
                .elements(".sidebar-favorites-items .collection-item")
                .then(function (results) {
                    expect(results.value.length).to.equal(0);
                })
        });
    });
    describe(`When searching manga`, () => {

        describe('When searching a manga the does not exists', () => {

            it('the list should be empty', () => {
                return setup.app.client
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
