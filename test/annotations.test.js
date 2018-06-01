var assert = require('assert');
var Ecore = require('../dist/ecore');
var _ = require('underscore');
var fs = require('fs');

describe('Annotations', function () {

    it('should read an ecore file containing annotations', function (done) {
        var resourceSet = Ecore.ResourceSet.create();
        var model = resourceSet.create({uri: 'http://www.example.org/example'});

        fs.readFile('./test/models/annotations.json', 'utf8', function (err, data) {
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

                var pp = model.get('contents').at(0);
                var fooClass = pp.get('eClassifiers').at(0);

                assert.ok(fooClass);
                assert.equal(1, fooClass.get('eAnnotations').size());

                var details = fooClass.get('eAnnotations').at(0).get('details');

                assert.equal("displayName", details.at(0).get('key'));
                assert.equal("value", details.at(0).get('value'));

                assert.equal("otherName", details.at(1).get('key'));
                assert.equal("otherValue", details.at(1).get('value'));

                done();
            }, {format: Ecore.JSON});
        });
    });

    it('should write annotations as object', function (done) {
        var resourceSet = Ecore.ResourceSet.create();
        var model = resourceSet.create({uri: 'http://www.example.org/example'});

        fs.readFile('./test/models/annotations.json', 'utf8', function (err, data) {

            model.load(data, function (model, err) {
                var result = Ecore.JSON.to(model);

                assert.equal("value", result.eClassifiers[0].eAnnotations[0].details.displayName);
                assert.equal("otherValue", result.eClassifiers[0].eAnnotations[0].details.otherName);
                done();
            }, {format: Ecore.JSON});
        });
    });

});