_ = require('underscore');
fs = require('fs');
var Ecore = require('../dist/ecore.xmi.js');
var assert = require("assert");


describe('#XMI', function() {

    describe('#parse', function() {

        it('should parse test1 correctly', function(done) {
            var resourceSet = Ecore.ResourceSet.create();
            var model = resourceSet.create({ uri: 'test1.xmi' });

            fs.readFile('./test/models/test1.xmi', 'utf8', function (err, data) {
                if (err) return console.log(err);

                var validate = function(model) {
                    var contents = model.get('contents');
                    assert.equal(1, contents.size());
                    var root = contents.at(0);
                    assert.strictEqual(Ecore.EPackage, root.eClass);
                    assert.strictEqual('test', root.get('name'));
                    assert.strictEqual('test', root.get('nsPrefix'));
                    assert.strictEqual('http:///www.eclipselabs.org/test', root.get('nsURI'));

                    var eClassifiers = root.get('eClassifiers');
                    assert.equal(1, eClassifiers.size());
                    var rootClass = eClassifiers.at(0);
                    assert.strictEqual(Ecore.EClass, rootClass.eClass);
                    assert.strictEqual('Root', rootClass.get('name'));
                    assert.equal(1, rootClass.get('eStructuralFeatures').size());

                    var rootClassLabel = rootClass.get('eStructuralFeatures').at(0);
                    assert.strictEqual(Ecore.EAttribute, rootClassLabel.eClass);

                    assert.strictEqual(Ecore.EString, rootClassLabel.get('eType'));
                };
                var success = function(model) {
                    validate(model);
                    done();
                };
                var error = function() {
                    done();
                };
                model.load(success, error, { data: data, format: Ecore.XMI });
            });

        });

        it('should parse test2 correctly', function(done) {
            var resourceSet = Ecore.ResourceSet.create();
            var model = resourceSet.create({ uri: 'test2.xmi' });

            fs.readFile('./test/models/test2.xmi', 'utf8', function (err, data) {
                if (err) return console.log(err);

                var validate = function(model) {
                    var contents = model.get('contents');
                    assert.equal(1, contents.size());
                    var root = contents.at(0);
                    assert.strictEqual(Ecore.EPackage, root.eClass);
                    assert.strictEqual('test', root.get('name'));
                    assert.strictEqual('test', root.get('nsPrefix'));
                    assert.strictEqual('http:///www.eclipselabs.org/test', root.get('nsURI'));

                    var eClassifiers = root.get('eClassifiers');
                    assert.equal(1, eClassifiers.size());
                    var rootClass = eClassifiers.at(0);
                    assert.strictEqual(Ecore.EClass, rootClass.eClass);
                    assert.strictEqual('Root', rootClass.get('name'));
                    assert.equal(2, rootClass.get('eStructuralFeatures').size());

                    var rootClassLabel = rootClass.get('eStructuralFeatures').at(0);
                    assert.strictEqual(Ecore.EAttribute, rootClassLabel.eClass);
                    assert.equal('label', rootClassLabel.get('name'));
                    assert.strictEqual(Ecore.EString, rootClassLabel.get('eType'));

                    var rootClassNumber = rootClass.get('eStructuralFeatures').at(1);
                    assert.strictEqual(Ecore.EAttribute, rootClassNumber.eClass);
                    assert.equal('number', rootClassNumber.get('name'));
                    assert.strictEqual(Ecore.EInt, rootClassNumber.get('eType'));
                };
                var success = function(model) {
                    validate(model);
                    done();
                };
                var error = function() {
                    done();
                };
                model.load(success, error, { data: data, format: Ecore.XMI });
            });
        });

    });

});


