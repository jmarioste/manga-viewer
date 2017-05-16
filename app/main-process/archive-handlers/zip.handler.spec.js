const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Promise = require('bluebird');
const expect = chai.expect;
const ZipHandler = require("./zip.handler");
const ZipMock = require("./zip.mock");
const yauzl = require('yauzl')
chai.should();
chai.use(sinonChai);

let instance, stub, zip;
describe('Zip Handler', () => {
    beforeEach(() => {
        instance = null;

        stub = sinon.stub(yauzl, 'open');
        stub.callsFake((path, options, cb) => {
            cb(null, new ZipMock([
                {
                    fileName: "1.jpg",
                    uncompressedSize: "650000"
                },
                {
                    fileName: "2.jpg",
                    uncompressedSize: "650000"
                },
                {
                    fileName: "3.jpg",
                    uncompressedSize: "650000"
                },
            ]))
        })
    });

    afterEach(() => {
        yauzl.open.restore();
    });

    describe('constructor', () => {
        it('should initialize properly', () => {
            instance = new ZipHandler("manga.zip", yauzl);
            expect(instance).to.not.be.null;
            expect(instance.yauzl).to.not.be.undefined;
            expect(instance.folderPath).to.not.be.undefined;
        });
    });

    describe('initialize', () => {

        it('should return a promise', () => {
            instance = new ZipHandler({}, yauzl);
            let promise = instance.initialize();
            expect(promise).to.be.instanceOf(Promise);
        });

        describe('on resolve', () => {
            it('it should use manga folderPath as path', (done) => {
                instance = new ZipHandler("manga.zip", yauzl);
                let promise = instance.initialize();
                promise.then((zip) => {
                    expect(stub).to.have.been.calledWith("manga.zip");
                    done();
                });
            })

            it('should pass a zip object from yauzl', (done) => {
                instance = new ZipHandler("manga.zip", yauzl);
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

                instance = new ZipHandler("manga.zip", yauzl);
                let promise = instance.initialize();

                promise.catch((err) => {
                    expect(err).to.be.instanceOf(Error);
                    expect(err.message).to.contain("Error opening file");
                }).finally((err) => {
                    done();
                });
            });
        });
    });

    describe('getImages', () => {

        it('should return all image objects in a .zip file', (done) => {
            instance = new ZipHandler({}, yauzl);

            instance.getImages().then(function (images) {
                expect(images.length).to.equal(3);
                images.forEach(image => expect(image.path).to.not.be.null);
                done();
            })
        });
    });

    describe('getReadStream', () => {
        it('should return the readStream for the path passed', (done) => {
            instance = new ZipHandler({}, yauzl);

            instance.getImages()
                .then(images => instance.getReadStream(images[0].path))
                .then(function (readStream) {
                    expect(readStream).to.not.be.null;
                    done();
                })
        });
    });


    describe('getPages', () => {
        it('should return base64 image on resolve', (done) => {
            instance = new ZipHandler({}, yauzl);
            let bufferStub = sinon.stub(instance, 'getBufferFrom')
            bufferStub.callsFake((readStream) => {
                return new Promise((resolve, reject) => {
                    resolve(new Buffer('test data'))
                });
            });

            instance.getPages(0, 2).then(function (images) {
                expect(images.length).to.equal(2);
                expect(images[0]).to.equal('data:image/bmp;base64,dGVzdCBkYXRh');
                instance.getBufferFrom.restore();
                done();
            }).catch((err) => {
                console.log("getPages catch", err);
            })
        })
    });

});
