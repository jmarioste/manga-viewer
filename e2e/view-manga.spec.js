const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('View Manga', function () {
    this.timeout(30000)

    beforeEach(function () {
        return setup.removeAppData()
            .then(function () {
                return setup.initApp();
            }).then(function () {
                return setup.app.client.selectDirectorySampleManga()
                    .waitForFinishLoading()
                    .pause(1500)
                    .click("#mangalist > div:nth-child(2)")
                    .pause(500)
                    .isExisting(".current-manga-page").should.eventually.be.true //already in view manga page
                    .getText(".current-manga-page").should.eventually.equal("1") //verify first page
            })
    });

    afterEach(setup.stopApp)



    describe('When in view manga page', () => {


        describe('App Bar', () => {
            it('.page-controls should be visible to the user', () => {
                return setup.app.client
                    .isExisting("topbar .page-controls").should.eventually.be.true
            });

            it('title of manga should be visible', () => {
                return setup.app.client
                    .getText("topbar .topbar-text > span > span").should.eventually.equal("z5pages")
            });

            it('add to favorites should be visible', () => {
                return setup.app.client
                    .isVisible("topbar .add-to-favorites").should.eventually.be.true
            });
        });

        describe('Page controls', () => {
            describe('On First page', () => {

                describe('Clicking next', () => {
                    it('Should go to next page', () => {
                        return setup.app.client
                            .click(".page-controls > .to-next")
                            .pause(300)
                            .getText(".current-manga-page").should.eventually.equal("2")
                    });
                });

                describe('Clicking prev', () => {
                    it('Should remain at page 1', () => {
                        return setup.app.client
                            .click(".page-controls > .to-previous")
                            .pause(300)
                            .getText(".current-manga-page").should.eventually.equal("1")
                    });
                });

            });

            describe('On Last Page page', () => {
                beforeEach(function goToLastPage() {
                    return setup.app.client
                        .clickPage("2")
                        .clickPage("3")
                        .clickPage("4")
                        .clickPage("5")
                        .clickPage("6")
                })

                describe('Clicking next', () => {
                    it('Should remain at last page', () => {
                        return setup.app.client
                            .click(".page-controls > .to-next")
                            .pause(300)
                            .getText(".current-manga-page").should.eventually.equal("6")
                    });
                });

                describe('Clicking prev', () => {
                    it('Should go back to previous page', () => {
                        return setup.app.client
                            .click(".page-controls > .to-previous")
                            .pause(300)
                            .getText(".current-manga-page").should.eventually.equal("5")
                    });
                });

            });
        });


        describe('Adding to favorites', () => {


            describe('When manga is not a favorites, clicking the favorite button', () => {

                it('should be add to favorites', () => {
                    return setup.app.client
                        .click("topbar .add-to-favorites")
                        .click("#favorites-btn")
                        .pause(1000)
                        .getText("#mangalist .manga .title").to.eventually.equal("z5Pages");
                });
            });
        });

        describe('Clicking the current image', () => {

            it('Should go to next page', () => {
                return setup.app.client
                    .clickPage("2")
            });
        });

        describe('View controls', () => {
            describe('Clicking fit-to-width', () => {

                it('Should give it a class fit-to-width', () => {
                    return setup.app.client
                        .click(".view-controls > div > .btn:nth-child(1)")
                        .isExisting(".view-manga.fit-width").should.eventually.be.true
                });
            });

            describe('Clicking fit-to-height', () => {

                it('Should give it a class fit-to-height', () => {
                    return setup.app.client
                        .click(".view-controls > div > .btn:nth-child(2)")
                        .isExisting(".view-manga.fit-height").should.eventually.be.true
                });
            });

            describe('Clicking zoom-in', () => {

                it('Should give it a class zoom-in', () => {
                    return setup.app.client
                        .click(".view-controls > div > .btn:nth-child(3)")
                        .isExisting(".view-manga.zoom-in").should.eventually.be.true
                        .element(".manga-page").getCssProperty("transform").then(function (result) {
                            return expect(result.value).to.contain("1.2")
                        })
                });
            });

            describe('Clicking back-to-default', () => {
                it('Should give it a class normal', () => {
                    return setup.app.client
                        .click(".view-controls > div > .btn:nth-child(4)")
                        .isExisting(".view-manga.normal").should.eventually.be.true
                });
            });

            describe('Clicking zoom-out', () => {

                it('Should give it a class zoom-out', () => {
                    return setup.app.client
                        .click(".view-controls > div > .btn:nth-child(5)")
                        .isExisting(".view-manga.zoom-out").should.eventually.be.true
                        .element(".manga-page").getCssProperty("transform").then(function (result) {
                            return expect(result.value).to.contain("0.8")
                        })
                });
            });
        });
    });

})
