var assert = require('assert');
var Ecore = require('../dist/ecore.xmi.js');
var _ = require('underscore');
var fs = require('fs');

describe('Generics', function () {

    it('should read an ecore file containing generics', function (done) {
        var resourceSet = Ecore.ResourceSet.create();
        var model = resourceSet.create({uri: 'http://emfjson.org/generics'});

        fs.readFile('./test/models/generic.ecore', 'utf8', function (err, data) {
            if (err) {
                console.log(err);
                done();
                return;
            }

            model.load(data, function (model, err) {
                if (err) {
                    console.log(err);
                    done();
                    return;
                }

                var contents = model.get('contents');
                assert.equal(1, contents.size());
                assert.strictEqual(contents.at(0).eClass, Ecore.EPackage);

                var pp = contents.at(0);

                var valueHolderClass = pp.get('eClassifiers').find(function (e) {
                    return e.get('name') === 'ValueHolder'
                });
                assert.ok(valueHolderClass);
                //assert.equal(valueHolderClass.get('abstract'), true);
                assert.strictEqual(valueHolderClass.get('eTypeParameters').size(), 1);
                assert.strictEqual(valueHolderClass.get('eStructuralFeatures').size(), 1);

                var typeParameter = valueHolderClass.get('eTypeParameters').at(0);
                assert.strictEqual(typeParameter.get('name'), "T");

                var feature = valueHolderClass.get('eStructuralFeatures').at(0);
                assert.strictEqual(feature.get('eGenericType').get('eTypeParameter'), typeParameter);

                var stringHolderClass = pp.get('eClassifiers').find(function (e) {
                    return e.get('name') === 'StringHolder'
                });
                assert.ok(stringHolderClass);
                //assert.equal(stringHolderClass.get('abstract'), false);
                assert.strictEqual(stringHolderClass.get('eGenericSuperTypes').size(), 1);

                var genericType = stringHolderClass.get('eGenericSuperTypes').at(0);
                assert.strictEqual(genericType.get('eClassifier'), valueHolderClass);
                assert.strictEqual(genericType.get('eTypeArguments').size(), 1);
                assert.strictEqual(genericType.get('eTypeArguments').at(0).get('eClassifier'), Ecore.EString);

                done();
            }, {format: Ecore.XMI});
        });
    });

});