const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('Favorites List', function () {
    this.timeout(30000)

    beforeEach(function () {
        return setup.removeAppData()
            .then(function () {
                return setup.initApp();
            }).then(function () {
                //setup favorites and go to favorites page
                return setup.app.client
                    .selectDirectorySampleManga()
                    .waitForFinishLoading()
                    .pause(2000)
                    .click(".include-subfolders > label.right")
                    .waitForFinishLoading()
                    .pause(1000)
                    .click("#mangalist > div:nth-child(1) .toggle-as-favorite")
                    .pause(1000)
                    .click("#mangalist > div:nth-child(2) .toggle-as-favorite")
                    .pause(1000)
                    .click(".sidebar #favorites-btn")
                    .pause(500)
                    .getElementCount("#mangalist > .manga").should.eventually.equal(2);
            }).catch(function () {
                return setup.app.client.getMainProcessLogs().then(function (logs) {
                    logs.forEach(function (log) {
                        if (log.indexOf("CONSOLE") < 0) {
                            console.log(log);
                        }
                    });
                })
            })
    });

    afterEach(setup.stopApp)

    describe(`When searching manga frmo favorites`, () => {
        let mangaList = "#mangalist > .manga";
        let tests = [
            { searchValue: "this-manga-does-not-exist.zip", expected: 0 },
            { searchValue: "sample", expected: 1 },
            { searchValue: "a", expected: 2 },
            { searchValue: ".zip", expected: 0 },
        ];

        tests.forEach(function (test) {
            describe(`When search value is "${test.searchValue}"`, () => {

                it(`should return ${test.expected} manga(s)`, () => {
                    return setup.app.client
                        .waitForFinishLoading()
                        .pause(500)
                        .searchManga(test.searchValue)
                        .pause(500)
                        .getElementCount(mangaList).should.eventually.equal(test.expected);
                });
            });

        })

    });

    describe('When clicking favorite button in manga', () => {
        it('Should remove manga from favorites', () => {
            return setup.app.client
                .click("#mangalist > .manga:nth-child(1) .toggle-as-favorite")
                .pause(1000)
                .getElementCount("#mangalist > .manga").should.eventually.equal(1);
        });
    });


    describe('When clicking manga in favorites', () => {
        it('Go to view manga page', () => {
            return setup.app.client
                .click("#mangalist > div:nth-child(1)")
                .waitForExist("#mangalist", 10000, true)
                .isExisting("#mangalist").should.eventually.be.false
                .pause(1009)
                .isExisting(".view-manga").should.eventually.be.true
        });
    });
})
