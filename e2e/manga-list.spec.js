const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('Manga List', function () {
    this.timeout(30000)
    // before(function () {
    //     // console.log(browser);
    //     return setup.removeAppData();
    // });

    beforeEach(function () {
        return setup.removeAppData()
            .then(function () {
                return setup.initApp();
            })
    });

    afterEach(setup.stopApp)


    describe('app bar when in mangalist page', () => {
        it('title should be Manga list', () => {
            return setup.app.client
                .getText("topbar .topbar-text > span > span").should.eventually.equal("Manga list")
        });
    });

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
            let bookmarkedFolders = ".sidebar-favorites-items .collection-item";
            return setup.app.client
                .selectDirectorySampleManga()
                .bookmarkFolder()
                .pause(500)
                .getElementCount(bookmarkedFolders).should.eventually.equal(1);
        });
    });

    describe(`When unbookmarking a folder`, function () {
        it('it should be removed from bookmarked folders', function () {
            let bookmarkedFolders = ".sidebar-favorites-items .collection-item";
            return setup.app.client
                .selectDirectorySampleManga()
                .bookmarkFolder()
                .pause(500)
                .bookmarkFolder()
                .pause(500)
                .getElementCount(bookmarkedFolders).should.eventually.equal(0);
        });
    });

    describe(`When searching manga`, () => {
        let mangaList = "#mangalist > .manga";
        let tests = [
            { searchValue: "this-manga-does-not-exist.zip", expected: 0 },
            { searchValue: "sample", expected: 1 },
            { searchValue: ".zip", expected: 2 },
        ];

        tests.forEach(function (test) {
            describe(`When search value is "${test.searchValue}"`, () => {

                it(`should return ${test.expected} manga(s)`, () => {
                    return setup.app.client
                        .selectDirectorySampleManga()
                        .waitForFinishLoading()
                        .pause(2000)
                        .searchManga(test.searchValue)
                        .waitForFinishLoading()
                        .getElementCount(mangaList).should.eventually.equal(test.expected);
                });
            });

        })

    })

    describe('When include subfolders is clicked', () => {

        it('Should display all the mangas recursively', () => {
            return setup.app.client
                .selectDirectorySampleManga()
                .waitForFinishLoading()
                .pause(1000)
                .click(".include-subfolders > label.right")
                .pause(1000)
                .waitForFinishLoading()
                .pause(2000)
                .getElementCount("#mangalist > .manga").should.eventually.equal(3);
        });
    });


    describe('When clicking a manga from manga list,', () => {

        it('it should transfer to view manga page', () => {
            return setup.app.client
                .selectDirectorySampleManga()
                .waitForFinishLoading()
                .waitForExist("#mangalist .manga", 10000)
                .click("#mangalist .manga")
                .waitForExist("#mangalist", 10000, true)
                .isExisting("#mangalist").should.eventually.be.false
                .isExisting(".view-manga").should.eventually.be.true
        });
    });


    describe('Adding/Removing manga to/from favorites', () => {
        describe('When manga is not yet a favorite', () => {
            it(`it should show a toast with "Added to favorites!" as feedback`, () => {
                let toastContainer = "#toast-container div";
                return setup.app.client
                    .selectDirectorySampleManga()
                    .waitForFinishLoading()
                    .waitForExist("#mangalist .manga", 10000)
                    .click("#mangalist .manga .toggle-as-favorite")
                    .pause(500)
                    .isExisting(toastContainer).should.eventually.be.true
                    .getText(toastContainer).should.eventually.equal("Added to favorites!")
                    .waitForExist(toastContainer, 10000, true)
                    .isExisting(toastContainer).should.eventually.be.false
            })
        });

        describe('When manga is already a favorite', () => {
            it(`it should show a toast with "Remove from favorites!" as feedback`, () => {
                let toastContainer = "#toast-container div";
                return setup.app.client
                    .selectDirectorySampleManga()
                    .waitForFinishLoading()
                    .waitForExist("#mangalist .manga", 10000)
                    .click("#mangalist .manga .toggle-as-favorite")
                    .waitForExist(toastContainer, 10000, true)
                    .pause(1000)
                    .click("#mangalist .manga .toggle-as-favorite")
                    .isExisting(toastContainer).should.eventually.be.true
                    .getText(toastContainer).should.eventually.equal("Removed from favorites!")
                    .waitForExist(toastContainer, 10000, true)
                    .isExisting(toastContainer).should.eventually.be.false
            })
        });
    });

})
