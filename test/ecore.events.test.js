var Ecore = require('../dist/ecore.js');
var assert = require("assert");

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

});
