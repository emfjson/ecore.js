var Ecore   = require('../dist/ecore.js');
var assert  = require('assert');
var _       = require('underscore');

describe('index', function() {

    var resource;

    beforeEach(function() {
        var resourceSet = Ecore.ResourceSet.create();

        var p = Ecore.EPackage.create({ name: 'p' });
        var a = Ecore.EClass.create({ name: 'A' });
        var b = Ecore.EClass.create({ name: 'B' });

        p.get('eClassifiers')
            .add(a)
            .add(b);

        resource = resourceSet.create('test');
        resource.add(p);
    });

    it('should have index', function() {
        var index = resource._index();
        assert.ok(index);
        assert.equal(3, _.keys(index).length);
    })

    it('should be updated when adding an element', function(done) {
        assert.ok(resource._index());

        resource.on('add', function(list) {
            assert.ok(resource.__updateIndex === true);

            var index = resource._index();
            assert.equal(4, _.keys(index).length);

            assert.strictEqual(index, resource.__index);

            done();
        })

        var c = Ecore.EClass.create({ name: 'C' });
        resource.get('contents').at(0).get('eClassifiers').add(c);
    })

    it('should be update when removing an element', function(done) {
        var index = resource._index();
        assert.equal(3, _.keys(index).length);

        resource.on('remove', function(list) {
            assert.ok(resource.__updateIndex === true);
            index = resource._index();
            assert.equal(2, _.keys(index).length);

            done();
        })

        var root = resource.get('contents').at(0);
        root.get('eClassifiers').remove(root.get('eClassifiers').at(1));
    })

})

