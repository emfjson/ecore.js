var Ecore = this.Ecore;
var assert = this.assert;

if (typeof require === 'function') {
    _ = require('underscore');
    Ecore = require('../dist/ecore.js');
    assert = require("assert");
}

describe('Events', function() {

    it('should be available in all EObject instances', function() {
        assert.ok(Ecore.EcorePackage.on);
        assert.ok(Ecore.EClass.on);
        assert.ok(Ecore.EObject.on);
        assert.ok(Ecore.EObject.off);
        assert.ok(Ecore.EObject.trigger);
    });

    describe('#on', function() {

        it('should be triggerd', function() {
            var Test = Ecore.EClass.create({ name: 'Test' });
            Test.on('eve', function() { Test.set('name', 'Tested'); });
            Test.trigger('eve');

            assert.equal(Test.get('name'), 'Tested');
        });

        it('should bind and trigger multiple events', function() {
            var Test = Ecore.EAttribute.create({ name: 'Test', upperBound: 0 });
            Test.on('a b c', function() {
                Test.set({ 'upperBound': Test.get('upperBound') + 1 });
            });

            assert.equal(0, Test.get('upperBound'));

            Test.trigger('a');
            assert.equal(1, Test.get('upperBound'));

            Test.trigger('a b');
            assert.equal(3, Test.get('upperBound'));

            Test.trigger('c');
            assert.equal(4, Test.get('upperBound'));

            Test.off('a c');

            Test.trigger('a b c');
            assert.equal(5, Test.get('upperBound'));
        });
    });

    describe('#off', function() {
    });

    describe('#trigger', function() {
    });

    describe('#set', function() {

        it('should trigger a change event after setting a property', function() {
            var Test = Ecore.EClass.create({ name: 'Test' });
            Test.on('change', function(changed) {
                assert.equal('name', changed);
                assert.equal('TestTest', Test.get(changed));
            });
            Test.on('change:name', function(changed) {
                assert.equal('name', changed);
                assert.equal('TestTest', Test.get(changed));
            });
            Test.set('name', 'TestTest');
        });

    });

    describe('#EList.add', function() {

        it('should trigger an add event', function() {
            var Test = Ecore.EClass.create({ name: 'Test' });
            var Name = Ecore.EAttribute.create({ name: 'name', eType: Ecore.EString });
            Test.on('add:eStructuralFeatures', function(added) {
                assert.strictEqual(Name, added);
            });
            Test.get('eStructuralFeatures').add(Name);
        });

    });

    describe('#ResourceSet.create', function() {

        it('should trigger an add event', function() {
            var resourceSet = Ecore.ResourceSet.create();

            resourceSet.on('add', function(resource) {
                assert.ok(resource);
                assert.equal(1, resourceSet.get('resources').size());
                assert.equal("sample.ecore", resourceSet.get('resources').at(0).get('uri'));
            });

            resourceSet.create({ uri: 'sample.ecore' });
        });

    });

});
