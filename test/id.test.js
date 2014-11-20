var Ecore = require('../dist/ecore.js');
var assert = require('assert');

describe('ids', function() {

    var rs = Ecore.ResourceSet.create();
    var r  = rs.create('id-test');

    var data = {
        eClass: 'http://www.eclipse.org/emf/2002/Ecore#//EPackage',
        _id: '1',
        name: 'p',
        eClassifiers: [
            {
                eClass: 'http://www.eclipse.org/emf/2002/Ecore#//EClass',
                _id: '2',
                name: 'A'
            },
            {
                eClass: 'http://www.eclipse.org/emf/2002/Ecore#//EClass',
                _id: '3',
                name: 'B',
                eSuperTypes: [
                    {
                        $ref: '2'
                    }
                ]
            }
        ]
    };

    r.parse(data);

    assert.equal(1, r.get('contents').size());

    var root = r.get('contents').at(0);
    assert.equal(2, root.get('eClassifiers').size());

    var a = root.get('eClassifiers').at(0);
    var b = root.get('eClassifiers').at(1);

    assert.equal('A', a.get('name'));
    assert.equal('B', b.get('name'));

    it('should contain one object with _id', function() {
        assert.equal('1', root._id);
        assert.equal('2', a._id);
        assert.equal('3', b._id);
    })

    it('should have for fragment _id', function() {
        assert.equal('1', root.fragment());
        assert.equal('2', a.fragment());
        assert.equal('3', b.fragment());
    })

    it('should be present in resource._index()', function() {
        var idx = r._index();

        assert.ok(idx);
        assert.strictEqual(root, idx['1']);
        assert.strictEqual(a, idx['2']);
        assert.strictEqual(b, idx['3']);
    })

    it('should be accessible from resource.getEObject()', function() {
        var found = r.getEObject('1');
        assert.strictEqual(root, found);

        found = r.getEObject('2');
        assert.strictEqual(a, found);

        found = r.getEObject('3');
        assert.strictEqual(b, found);
    })

    it('should be accessible from resourceSet.getEObject()', function() {
        var found = rs.getEObject('id-test#1');
        assert.strictEqual(root, found);

        found = rs.getEObject('id-test#2');
        assert.strictEqual(a, found);

        found = rs.getEObject('id-test#3');
        assert.strictEqual(b, found);
    })

    it('should be used to resolve references', function() {
        assert.equal(1, b.get('eSuperTypes').size());
        assert.equal(a, b.get('eSuperTypes').at(0));
    })

    it('should serialize id', function() {
        var data = r.to();

        assert.ok(data._id);
        assert.equal('1', data._id);
        assert.equal(2, data.eClassifiers.length);
        assert.equal('2', data.eClassifiers[0]._id);
        assert.equal('3', data.eClassifiers[1]._id);
    })

})
