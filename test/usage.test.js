_ = require('../lib/underscore.js');
var Ecore = require('../dist/ecore.js');
var assert = require("assert");

describe('Usage', function() {

    describe('creation of an EClass', function() {

        it('should be correctly created', function() {
            var MyClass = Ecore.create(Ecore.EcorePackage.EClass);

            assert.ok(MyClass);
            assert.ok(MyClass instanceof Ecore.EObject);
            assert.strictEqual(MyClass.eClass, Ecore.EcorePackage.EClass);

            assert.ok(MyClass.has('eStructuralFeatures'));
            assert.ok(MyClass.has('eSuperTypes'));
            assert.ok(MyClass.has('abstract'));
            assert.ok(MyClass.has('interface'));
            assert.ok(MyClass.has('name'));

            MyClass.set('name', 'MyClass');

            assert.equal(MyClass.get('name'), 'MyClass');
            assert.equal(MyClass.get('abstract'), false);
            assert.equal(MyClass.get('eStructuralFeatures').size(), 0);

            MyClass.set('abstract', true);
            assert.equal(MyClass.get('abstract'), true);
        });

        it('other', function() {
            var MyClass = Ecore.EcoreFactory.create('EClass');

            assert.ok(MyClass);
            assert.strictEqual(MyClass.eClass, Ecore.EcorePackage.EClass);
            assert.ok(MyClass.has('eStructuralFeatures'));
            assert.ok(MyClass.has('eSuperTypes'));
            assert.ok(MyClass.has('abstract'));
            assert.ok(MyClass.has('interface'));
            assert.ok(MyClass.has('name'));

            MyClass.set('name', 'MyClass');

            assert.equal(MyClass.get('name'), 'MyClass');
            assert.equal(MyClass.get('abstract'), false);
            assert.equal(MyClass.get('eStructuralFeatures').size(), 0);

            MyClass.set('abstract', true);
            assert.equal(MyClass.get('abstract'), true);
        });

    });


    describe('creation of an EObject', function() {
        var User;

        before(function() {
            User = Ecore.EcoreFactory.createEClass({name: 'User'});
            var User_name = Ecore.EcoreFactory.createEAttribute({
                name: 'name',
                eType: Ecore.EcorePackage.EString
            });
            var User_friends = Ecore.EcoreFactory.createEReference({
                name: 'friends',
                eType: User
            });
            User.get('eStructuralFeatures').add(User_name);
            User.get('eStructuralFeatures').add(User_friends);
        });

        it('should be an instanceof User', function() {
            var u1 = Ecore.create(User);

            assert.ok(u1);
            assert.strictEqual(u1.eClass, User);
            assert.ok(u1.isTypeOf('User'));
        });

        it('should have 2 structural features, name & friends', function() {
            var u1 = Ecore.create(User);
            assert.ok(u1.has('name'));
            assert.ok(u1.has('friends'));
        });

    });

});