const setup = require('./application-setup');
const chai = require('chai');

const expect = chai.expect;


describe('Settings Page', function () {
    this.timeout(30000)


    beforeEach(function () {
        return setup.initApp();
    });

    afterEach(setup.stopApp)


    describe('App bar when in Settings page', () => {
        it('title should be Settings', () => {
            return setup.app.client
                .click("#settings-btn")
                .pause(300)
                .getText("topbar .topbar-text > span > span").should.eventually.equal("Settings")
        });
    });


    describe('General settings', () => {
        before(function () {
            return setup.removeAppData();
        });

        beforeEach(function () {
            return setup.app.client
                .click("#settings-btn")
                .pause(300)
        })

        describe('Include subfolders', () => {

            describe('When include subfolders is switched on', () => {

                it('Include sub folders in manga list should be on', () => {
                    return setup.app.client
                        .click("#include-subfolders")
                        .pause(500)
                        .getText("#include-label").should.eventually.equal("On")
                        .selectDirectorySampleManga()
                        .click(".sidebar-directory .collection-item") //go to manga list
                        .pause(500)
                        .getText(".include-subfolders .include-label").should.eventually.equal("On")
                });

            });


            describe('When starting app and  include-subfolders is "on"  previously ', () => {

                it('Should  retain "on" state', () => {
                    return setup.app.client
                        .selectDirectorySampleManga()
                        .click(".sidebar-directory .collection-item") //go to manga list
                        .pause(500)
                        .getText(".include-subfolders .include-label").should.eventually.equal("On")
                });

            });

        });

        //TODO AUTO UPDATE AND VIEW OPTIONS        
    });


    // describe('Hotkey shortcuts', () => {
    //     before(function () {
    //         return setup.removeAppData();
    //     });

    //     beforeEach(function () {
    //         return setup.app.client
    //             .click("#settings-btn")
    //             .pause(300)
    //     })


    //     describe('Bookmark folder', () => {

    //         it('Should be able to change bookmark folder hotkey', () => {
    //             let bookmarkedFolders = ".sidebar-favorites-items .collection-item";
    //             return setup.app.client
    //                 .click("#shortcut-list .valign-wrapper a")
    //                 .keys("Ctrl")
    //                 .keys("K")
    //                 .selectDirectorySampleManga()
    //                 .click(".sidebar-directory .collection-item") //go to manga list
    //                 .pause(2000)
    //                 .keys("Ctrl")
    //                 .keys("K")
    //                 .pause(2000)
    //                 .getElementCount(bookmarkedFolders).should.eventually.equal(1);
    //         });


    //         // it('Should be able to bookmark a folder using the present hot key for it', () => {

    //         // });

    //     });

    // });

})
