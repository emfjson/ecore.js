var Ecore = this.Ecore;
var assert = this.assert;

if (typeof require === 'function') {
    _ = require('underscore');
    Ecore = require('../dist/ecore.js');
    assert = require("assert");
}

describe('Model creation', function() {

    describe('EPackage creation', function() {

        var checkEPackage = function(ePackage) {
            assert.ok(ePackage);
            assert.strictEqual(ePackage.eClass, Ecore.EPackage);

            assert.ok(ePackage.has('name'));
            assert.ok(ePackage.has('nsURI'));
            assert.ok(ePackage.has('nsPrefix'));
            assert.ok(ePackage.has('eClassifiers'));
            assert.ok(ePackage.has('eSubPackages'));
        };

        it('should be done using Ecore.create', function() {
            var MyPackage = Ecore.create(Ecore.EPackage);

            checkEPackage(MyPackage);

            MyPackage.set('name', 'myPackage');
            assert.strictEqual('myPackage', MyPackage.get('name'));
        });

        it('should be done using Ecore.create with parameters', function() {
            var MyPackage = Ecore.create(Ecore.EPackage, { name: 'myPackage' });

            checkEPackage(MyPackage);
            assert.strictEqual('myPackage', MyPackage.get('name'));
        });

        it('should be done using EPackage.create', function() {
            var MyPackage = Ecore.EPackage.create();

            checkEPackage(MyPackage);

            MyPackage.set('name', 'myPackage');
            assert.strictEqual('myPackage', MyPackage.get('name'));
        });

        it('should be done using EPackage.create with parameters', function() {
            var MyPackage = Ecore.EPackage.create({ name: 'myPackage' });

            checkEPackage(MyPackage);
            assert.strictEqual('myPackage', MyPackage.get('name'));
        });

    });

    describe('EClass creation', function() {

        var checkEClass = function(eClass) {
            assert.ok(eClass);
            assert.strictEqual(eClass.eClass, Ecore.EClass);

            assert.ok(eClass.has('eStructuralFeatures'));
            assert.ok(eClass.has('eSuperTypes'));
            assert.ok(eClass.has('abstract'));
            assert.ok(eClass.has('interface'));
            assert.ok(eClass.has('name'));
        };

        it('should be done using Ecore.create', function() {
            var MyClass = Ecore.create(Ecore.EClass);

            checkEClass(MyClass);
            MyClass.set('name', 'MyClass');

            assert.strictEqual('MyClass', MyClass.get('name'));
            assert.strictEqual(false, MyClass.get('abstract'));
            assert.strictEqual(0, MyClass.get('eStructuralFeatures').size());

            MyClass.set('abstract', true);
            assert.equal(MyClass.get('abstract'), true);
        });

        it('should be done using EClass.create', function() {
            var MyClass = Ecore.EClass.create();

            checkEClass(MyClass);
            MyClass.set('name', 'MyClass');

            assert.strictEqual('MyClass', MyClass.get('name'));
            assert.strictEqual(false, MyClass.get('abstract'));
            assert.strictEqual(0, MyClass.get('eStructuralFeatures').size());


            MyClass.set('abstract', true);
            assert.equal(MyClass.get('abstract'), true);
        });

        it('should be done using Ecore.create with parameters', function() {
            var MyClass = Ecore.create(Ecore.EClass, { name: 'MyClass', abstract: false });

            checkEClass(MyClass);
            assert.strictEqual('MyClass', MyClass.get('name'));
            assert.strictEqual(false, MyClass.get('abstract'));
            assert.strictEqual(0, MyClass.get('eStructuralFeatures').size());
        });

        it('should use eClass value from parameters', function() {
            var MyClass = Ecore.create(Ecore.EClassifier, { eClass: Ecore.EClass, name: 'MyClass', abstract: false });

            checkEClass(MyClass);
            assert.strictEqual('MyClass', MyClass.get('name'));
            assert.strictEqual(false, MyClass.get('abstract'));
            assert.strictEqual(0, MyClass.get('eStructuralFeatures').size());
        });

        it('should be done using EClass.create with parameters', function() {
            var MyClass = Ecore.EClass.create({ name: 'MyClass', abstract: false });

            checkEClass(MyClass);
            assert.strictEqual('MyClass', MyClass.get('name'));
            assert.strictEqual(false, MyClass.get('abstract'));
            assert.strictEqual(0, MyClass.get('eStructuralFeatures').size());
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

    describe('EAttribute creation', function() {
        var checkEAttribute = function(eAttribute) {
            assert.ok(eAttribute);
            assert.ok(eAttribute.has('name'));
            assert.ok(eAttribute.has('lowerBound'));
            assert.ok(eAttribute.has('upperBound'));
            assert.ok(eAttribute.has('eType'));
            assert.ok(eAttribute.has('derived'));
            assert.ok(eAttribute.has('many'));
        };

        it('should be done using Ecore.create', function() {
            var MyAttr = Ecore.create(Ecore.EAttribute);
            checkEAttribute(MyAttr);

            MyAttr.set('name', 'foo');
            MyAttr.set('eType', Ecore.EString);
            MyAttr.set('derived', true);

            assert.strictEqual('foo', MyAttr.get('name'));
            assert.strictEqual(Ecore.EString, MyAttr.get('eType'));
            assert.strictEqual(true, MyAttr.get('derived'));
            assert.strictEqual(0, MyAttr.get('lowerBound'));
            assert.strictEqual(1, MyAttr.get('upperBound'));
        });

        it('should be done using Ecore.create with parameters', function() {
            var MyAttr = Ecore.create(Ecore.EAttribute, {
                name: 'foo',
                eType: Ecore.EString,
                derived: true
            });
            checkEAttribute(MyAttr);

            assert.strictEqual('foo', MyAttr.get('name'));
            assert.strictEqual(Ecore.EString, MyAttr.get('eType'));
            assert.strictEqual(true, MyAttr.get('derived'));
            assert.strictEqual(0, MyAttr.get('lowerBound'));
            assert.strictEqual(1, MyAttr.get('upperBound'));
        });
    });

    describe('EReference creation', function() {
        var checkEReference = function(eReference) {
            assert.ok(eReference);
            assert.ok(eReference.has('name'));
            assert.ok(eReference.has('eType'));
            assert.ok(eReference.has('lowerBound'));
            assert.ok(eReference.has('upperBound'));
            assert.ok(eReference.has('derived'));
            assert.ok(eReference.has('containment'));
        };

        it('should be done using Ecore.create', function() {
            var MyRef = Ecore.create(Ecore.EReference, {
                name: 'foo'
            });

            checkEReference(MyRef);

            assert.strictEqual('foo', MyRef.get('name'));
            assert.strictEqual(0, MyRef.get('lowerBound'));
            assert.strictEqual(1, MyRef.get('upperBound'));
//            assert.strictEqual(false, MyRef.get('derived'));
//            assert.strictEqual(false, MyRef.get('containment'));
        });

        it('should be done using EReference.create', function() {
            var MyRef = Ecore.EReference.create({
                name: 'foo'
            });

            checkEReference(MyRef);

            assert.strictEqual('foo', MyRef.get('name'));
            assert.strictEqual(0, MyRef.get('lowerBound'));
            assert.strictEqual(1, MyRef.get('upperBound'));

            MyRef.set('derived', true);
            MyRef.set('containment', true);
            assert.strictEqual(true, MyRef.get('derived'));
            assert.strictEqual(true, MyRef.get('containment'));
        });
    });

    describe('EOperation creation', function() {
        var checkEOperation = function(eOperation) {

        };
    });

    describe('EAnnotation creation', function() {
        var checkEAnnotation = function(eAnnotation) {
            assert.ok(eAnnotation);
            assert.ok(eAnnotation.has('source'));
            assert.ok(eAnnotation.has('details'));
        };

        it('should be done using Ecore.create', function() {
            var MyAnn = Ecore.create(Ecore.EAnnotation, {
                source: 'foo',
                details: [
                    {
                        key: 'kk',
                        value: 'val'
                    }
                ]
            });
            checkEAnnotation(MyAnn);

            assert.strictEqual('foo', MyAnn.get('source'));
            assert.strictEqual(1, MyAnn.get('details').size());
            assert.strictEqual('kk', MyAnn.get('details').at(0).get('key'));
            assert.strictEqual('val', MyAnn.get('details').at(0).get('value'));
        });

        it('should create details entry with EStringToStringMapEntry.create', function() {
            var d = Ecore.EStringToStringMapEntry.create({ key: 'k', value: 'v' });

            assert.ok(d);
            assert.strictEqual(Ecore.EStringToStringMapEntry, d.eClass);
            assert.ok(d.has('key'));
            assert.ok(d.has('value'));

            assert.strictEqual('k', d.get('key'));
            assert.strictEqual('v', d.get('value'));
        });

    });

    it('should be done using a json like syntax', function() {
        var p = Ecore.EPackage.create({
            name: 'p',
            nsPrefix: 'p',
            nsURI: 'http://test/p',
            eClassifiers: [
                {
                    eClass: Ecore.EClass,
                    name: 'A',
                    eAnnotations: [
                        {
                            source: 'test',
                            details: [
                                {
                                    key: 'k',
                                    value: 'v'
                                }
                            ]
                        }
                    ],
                    eStructuralFeatures: [
                        {
                            eClass: Ecore.EAttribute,
                            name: 'aa',
                            eType: Ecore.EString
                        },
                        {
                            eClass: Ecore.EReference,
                            name: 'bb',
                            // eType: '//A'
                            eType: function() { return p.get('eClassifiers').at(0); }
                        }
                    ]
                }
            ]
        });

        assert.ok(p);

        assert.strictEqual('p', p.get('name'));
        assert.strictEqual(1, p.get('eClassifiers').size());

        var A = p.get('eClassifiers').at(0);
        assert.strictEqual(Ecore.EClass, A.eClass);
        assert.strictEqual('A', A.get('name'));
        assert.strictEqual(1, A.get('eAnnotations').size());

        var Aann = A.get('eAnnotations').at(0);
        assert.strictEqual('test', Aann.get('source'));
        assert.strictEqual(1, Aann.get('details').size());
        var d = Aann.get('details').at(0);
        assert.strictEqual(Ecore.EStringToStringMapEntry, d.eClass);
        assert.strictEqual('k', d.get('key'));
        assert.strictEqual('v', d.get('value'));

        assert.strictEqual(2, A.get('eStructuralFeatures').size());

        var aa = A.get('eStructuralFeatures').at(0);
        assert.strictEqual(Ecore.EAttribute, aa.eClass);
        assert.strictEqual('aa', aa.get('name'));
        assert.strictEqual(Ecore.EString, aa.get('eType'));

        var bb = A.get('eStructuralFeatures').at(1);
        assert.strictEqual(Ecore.EReference, bb.eClass);
        assert.strictEqual('bb', bb.get('name'));
        assert.strictEqual(A, bb.get('eType'));
    });

});

var createModel = function() {
    var resourceSet = Ecore.ResourceSet.create();
    var m1 = resourceSet.create({ uri: 'model1' });
    var p1 = Ecore.EPackage.create({ name: 'p1', nsPrefix: 'model1', nsURI: 'model1' });
    var Foo = Ecore.EClass.create({ name: 'Foo' });
    var Bar = Ecore.EClass.create({ name: 'Bar' });
    var BarBar = Ecore.EClass.create({ name: 'BarBar' });
    var FooAnnotation = Ecore.EAnnotation.create({ source: 'foo' });

    Foo.get('eStructuralFeatures')
        .add(
                Ecore.EReference.create({
                    name: 'child',
                    upperBound: -1,
                    eType: Foo,
                    containment: true
                }))
        .add(
                Ecore.EAttribute.create({
                    name: 'label',
                    upperBound: 1,
                    eType: Ecore.EString
                }))
        .add(
                Ecore.EAttribute.create({
                    name: 'numbers',
                    upperBound: -1,
                    eType: Ecore.EInt
                }));

    Foo.get('eAnnotations').add(FooAnnotation);
    Bar.get('eSuperTypes').add(Foo);
    BarBar.get('eSuperTypes').add(Bar);

    p1.get('eClassifiers').add(Foo);
    p1.get('eClassifiers').add(Bar);
    p1.get('eClassifiers').add(BarBar);
    m1.get('contents').add(p1);

    return m1;
};

describe('Instance creation', function() {

    var model = createModel();
    var p1 = model.get('contents').at(0);
    var Foo = p1.get('eClassifiers').at(0);
    var Bar = p1.get('eClassifiers').at(1);
    var BarBar = p1.get('eClassifiers').at(2);

    describe('creation of an EClass', function() {

        it('should return correct subtypes', function() {
            // allSubTypes makes use of EPackage.Registry to lookup
            // EClasses
            Ecore.EPackage.Registry.register(p1);

            var FooSubs = Foo.get('eAllSubTypes');
            assert.equal(2, FooSubs.length);
            assert.ok(_.contains(FooSubs, Bar));
            assert.ok(_.contains(FooSubs, BarBar));
        });

        it('should have correct annotations', function() {
            assert.equal(1, Foo.get('eAnnotations').size());

            var ann = Foo.get('eAnnotations').at(0);
            assert.equal('foo', ann.get('source'));
        });

        it('should create instances with correct values passed in create', function() {
            var f = Foo.create({ label: 'f', numbers: [1, 2, 3] });

            assert.ok(f);
            assert.strictEqual(Foo, f.eClass);
            assert.strictEqual('f', f.get('label'));
            assert.deepEqual([1, 2, 3], f.get('numbers'));
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

        it('should set feature using feature name', function() {
            var u1 = Ecore.create(User);
            u1.set('name', 'Paul');

            assert.strictEqual('Paul', u1.get('name'));
        });

        it('should set feature using feature object', function() {
            var u1 = Ecore.create(User);
            var feature = User.getEStructuralFeature('name');

            assert.ok(feature);

            u1.set(feature, 'Paul');

            assert.strictEqual('Paul', u1.get('name'));
        });

        it('should set feature using hash parameters', function() {
            var u1 = Ecore.create(User);

            u1.set({ name: 'Paul' });

            assert.strictEqual('Paul', u1.get('name'));
        });

    });

});
