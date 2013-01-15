_ = require('../lib/underscore.js');
var Ecore = require('../dist/ecore.js');
var assert = require("assert");

describe('Usage', function() {

    describe('creation of an EClass', function() {

        it('should be correctly created', function() {
            var MyClass = Ecore.create(Ecore.EClass);

            assert.ok(MyClass);
            assert.strictEqual(MyClass.eClass, Ecore.EClass);

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

        it('should create a EClass by calling EClass.create', function() {
            var MyClass = Ecore.EClass.create();

            assert.ok(MyClass);
            assert.strictEqual(MyClass.eClass, Ecore.EClass);
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

        it('should return correct eStructuralFeatures', function() {
            var MyClass = Ecore.EClass.create();
            assert.strictEqual(0, MyClass.get('eAllStructuralFeatures').length);

            var Name = Ecore.EAttribute.create({ name: 'name', eType: Ecore.EString });
            MyClass.get('eStructuralFeatures').add(Name);

            assert.strictEqual(1, MyClass.get('eAllStructuralFeatures').length);
            assert.strictEqual(Name, MyClass.get('eAllStructuralFeatures')[0]);

            var SuperClass = Ecore.EClass.create();
            MyClass.get('eSuperTypes').add(SuperClass);

            assert.strictEqual(1, MyClass.get('eAllStructuralFeatures').length);

            var SuperAttr = Ecore.EAttribute.create({ name: 'value', eType: Ecore.EString });
            SuperClass.get('eStructuralFeatures').add(SuperAttr);

            assert.strictEqual(1, SuperClass.get('eAllStructuralFeatures').length);
            assert.strictEqual(2, MyClass.get('eAllStructuralFeatures').length);

            var OtherAttr = Ecore.EAttribute.create({ name: 'other', eType: Ecore.EString });
            MyClass.get('eStructuralFeatures').add(OtherAttr);

            assert.strictEqual(1, SuperClass.get('eAllStructuralFeatures').length);
            assert.strictEqual(3, MyClass.get('eAllStructuralFeatures').length);
        });

    });

    describe('creation of an EObject', function() {
        var User;

        before(function() {
            User = Ecore.EClass.create({name: 'User'});
            var User_name = Ecore.EAttribute.create({
                name: 'name',
                eType: Ecore.EString
            });
            var User_friends = Ecore.EReference.create({
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
