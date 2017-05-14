const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Promise = require('bluebird');
const expect = chai.expect;
const ZipHandler = require("./zip.handler");
const yauzl = require('yauzl')
chai.should();
chai.use(sinonChai);

let instance;
describe('Zip Handler', () => {
    beforeEach(() => {
        instance = null;
    });

    afterEach(() => {
    });

    describe('constructor', () => {
        it('should initialize properly', () => {
            instance = new ZipHandler({}, yauzl);
            expect(instance).to.not.be.null;
            expect(instance.yauzl).to.not.be.undefined;
            expect(instance.manga).to.not.be.undefined;
        });
    });

    describe('initialize', () => {
        let stub;
        beforeEach(() => {
            stub = sinon.stub(yauzl, 'open');
            stub.callsFake((path, options, cb) => {
                cb(null, {})
            })
        });

        afterEach(() => {
            yauzl.open.restore();
        });

        it('should return a promise', () => {
            instance = new ZipHandler({}, yauzl);
            let promise = instance.initialize();
            expect(promise).to.be.instanceOf(Promise);
        });

        describe('on resolve', () => {
            it('it should use manga folderPath as path', (done) => {
                instance = new ZipHandler({ folderPath: "manga.zip" }, yauzl);
                let promise = instance.initialize();
                promise.then((zip) => {
                    expect(stub).to.have.been.calledWith("manga.zip");
                    done();
                });
            })

            it('should pass a zip object from yauzl', (done) => {
                instance = new ZipHandler({ folderPath: "manga.zip" }, yauzl);
                let promise = instance.initialize();

                promise.then((zip) => {
                    expect(zip).to.not.be.null;
                }).finally((err) => {
                    done();
                });
            });
        });

        describe('on reject', () => {
            it('should pass an error message to callback', (done) => {
                stub.callsFake((path, options, cb) => {
                    cb("Error opening file");
                });

                instance = new ZipHandler({ folderPath: "manga.zip" }, yauzl);
                let promise = instance.initialize();

                promise.catch((err) => {
                    expect(err).to.contain("Error opening file");
                }).finally((err) => {
                    done();
                });
            });
        });
    });


});
