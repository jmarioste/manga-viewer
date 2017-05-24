const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('Sidebar', function () {
    this.timeout(30000)

    beforeEach(function () {
        return setup.removeAppData()
            .then(function () {
                return setup.initApp();
            })
    });

    afterEach(setup.stopApp)

    describe('Sidebar', () => {
        describe('When menu button is clicked', () => {
            it('it should toggle hide/show sidebar', () => {
                return setup.app.client
                    .isExisting(".show-nav .sidebar").should.eventually.be.true
                    .click("#menu-btn")
                    .pause(500)
                    .isExisting(".show-nav .sidebar").should.eventually.be.false
                    .click("#menu-btn")
                    .pause(500)
                    .isExisting(".show-nav .sidebar").should.eventually.be.true
            });
        });

        describe('When clicking favorites', () => {
            it('should go to favorites page', () => {
                return setup.app.client
                    .click(".sidebar #favorites-btn")
                    .pause(500)
                    .getText(".manga-list #header-text").should.eventually.equal("Favorites")
            });
        })

        describe('When clicking settings', () => {
            it('should go to favorites page', () => {
                return setup.app.client
                    .click(".sidebar #settings-btn")
                    .pause(500)
                    .getText(".content #header-text").should.eventually.equal("General Settings")
            });
        });

        describe('When clicking about button', () => {
            it('should show abouts modal', () => {
                return setup.app.client
                    .click(".sidebar #about-btn")
                    .waitForVisible("#about-modal", 10000)
                    .pause(1000)
                    .isVisible("#about-modal").should.eventually.be.true
            });
        });

        describe('When when a folder icon is clicked', () => {
            it('it should show subfolder', () => {
                return setup.app.client
                    .selectDirectorySampleManga()
                    .element(".folder-toggle")
                    .getText().should.eventually.equal("folder_open")
                    .click(".folder-toggle")
                    .pause(500)
                    .getText(".sidebar-directory li span").should.eventually.not.include('recursive')
                    .click(".folder-toggle")
                    .pause(500)
                    .getText(".sidebar-directory li span").should.eventually.include('recursive')
            });
        });
    });
})
