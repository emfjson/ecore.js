var assert  = require('assert');
var Ecore   = require('../dist/ecore.js');
var _       = require('underscore');


describe('EObject.eContents', function() {

    var resource, p;

    beforeEach(function() {
        var resourceSet = Ecore.ResourceSet.create();

        p = Ecore.EPackage.create({ name: 'p' });
        var a = Ecore.EClass.create({ name: 'A' });
        var b = Ecore.EClass.create({ name: 'B' });

        p.get('eClassifiers')
            .add(a)
            .add(b);

        resource = resourceSet.create('test');
        resource.add(p);
    });

    it('should return content of the object', function() {
        var contents = p.eContents();

        assert.ok(contents);
        assert.equal(2, contents.length);
    })

    it('should be updated when adding an element', function() {
        p.get('eClassifiers').add(Ecore.EClass.create({ name: 'C' }));

        var contents = p.eContents();

        assert.ok(contents);
        assert.equal(3, contents.length);
        assert.strictEqual(contents, p.eContents());
    })

    it('should be updated when removing an element', function() {
        p.get('eClassifiers').remove(p.get('eClassifiers').at(1));

        var contents = p.eContents();

        assert.ok(contents);
        assert.equal(1, contents.length);
        assert.strictEqual(contents, p.eContents());
    })

})
