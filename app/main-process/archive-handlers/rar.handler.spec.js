const RarHandler = require('./rar.handler');
const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const Promise = require('bluebird');
const expect = chai.expect;

chai.should();
chai.use(sinonChai);

let instance, rf, getFilenamesStub;

describe('RarHandler', () => {
    beforeEach(() => {

        rf = {};
        instance = new RarHandler({}, rf);
        
        getFilenamesStub = sinon.stub(instance, 'getFilenames');
        getFilenamesStub.callsFake(function () {
            return new Promise((resolve) => {
                resolve([                    
                    '1.jpg',
                    '2.png',
                    '3.exe',
                    '4.pdf'
                ])
            });
        });
    })

    afterEach(() => {
        instance = null;
        getFilenamesStub.restore();
    })

    describe('constructor', () => {
        it('should initialize properly', () => {
            expect(instance.imagesFiles.length).to.equal(0);
            expect(instance.manga).to.not.be.null;
            expect(instance.rf).to.equal(rf);
        });
    });

    describe('getImageFiles', () => {
        it('should return .png and .jpg files inside a .rar file', () => {

            instance.getAllImageFiles().then((images) => {
                expect(images).to.contain('1.jpg');
                expect(images).to.contain('2.png')
                expect(images).to.not.contain('3.exe');
                expect(images).to.not.contain('4.pdf');
            })
        })
    });

    describe('getThumbnailBuffer', () => {
        
        it('should call instance.getBuffer with the first image', (done) => {
                        
            let stub = sinon.stub(instance, 'getBuffer').callsFake((args) => args);
            instance.getThumbnailBuffer().then(() => {
                expect(stub).to.have.been.calledWith('1.jpg');
                stub.restore();
                done();
            })
        });
    });

    describe('getPages', () => {
        it('should return base64 images on resolve', (done) => {
            let stub = sinon.stub(instance, 'getBuffer').callsFake(() => {
                return Buffer.from('sample string', 'utf8');
            });

            instance.getPages(0, 2).then(function (images) {
                console.log("inside then")
                expect(images.length).to.equal(2);
                expect(images[0]).to.be.a('string');
                done();
            })

        })
    })    
})
