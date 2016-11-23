var assert  = require('assert');
var Ecore   = require('../dist/ecore.js');
var _       = require('underscore');

var createResource = function(name) {
    var resourceSet = Ecore.ResourceSet.create();
    return resourceSet.create(name);
};

var Edit = Ecore.Edit;

describe('Edit', function() {

    describe('#childTypes', function() {

        assert.ok(Edit.childTypes);
        assert.equal('function', typeof Edit.childTypes);

        it('should return the types EClass, EDataType EEnum, EPackage and EAnnotation from a EPackage object', function() {
            var resource = createResource('model.json');
            var p = Ecore.EPackage.create({ name: 'p' });
            resource.get('contents').add(p);

            var types = Edit.childTypes(p);

            assert.ok(types);
            assert.equal(5, types.length);

            var names = types.map(function(e) { return e.get('name'); });

            assert.equal(false, _.include(names, null));
            assert.ok(_.include(names, 'EClass'));
            assert.ok(_.include(names, 'EDataType'));
            assert.ok(_.include(names, 'EAnnotation'));
            assert.ok(_.include(names, 'EPackage'));
            assert.ok(_.include(names, 'EEnum'));
        });

        it('should return the correct child types from a EClass object', function() {
            var resource = createResource('model.json');
            var c = Ecore.EClass.create({ name: 'c' });
            resource.get('contents').add(c);

            var types = Edit.childTypes(c);

            assert.ok(types);
            assert.equal(6, types.length);

            var names = types.map(function(e) { return e.get('name'); });

            assert.equal(false, _.include(names, null));
            assert.ok(_.include(names, 'EAnnotation'));
            assert.ok(_.include(names, 'EAttribute'));
            assert.ok(_.include(names, 'EReference'));
            assert.ok(_.include(names, 'EOperation'));
            assert.ok(_.include(names, 'ETypeParameter'));
            assert.ok(_.include(names, 'EGenericType'));
        });

    });

    describe('#childDescriptors', function() {
        assert.ok(Edit.childDescriptors);
        assert.equal('function', typeof Edit.childDescriptors);

        it('should return descriptors for each child types of a EPackage object', function() {
            var resource = createResource('model.json');
            var p = Ecore.EPackage.create({ name: 'p' });
            resource.get('contents').add(p);

            var descriptors = Edit.childDescriptors(p);

            assert.ok(descriptors);
            assert.equal(5, descriptors.length);

            var descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EClass; });

            assert.ok(descriptor);
            assert.strictEqual('New EClass', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eClassifiers')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EClass, descriptor.type);

            descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EDataType; });

            assert.ok(descriptor);
            assert.strictEqual('New EDataType', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eClassifiers')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EDataType, descriptor.type);

            descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EEnum; });

            assert.ok(descriptor);
            assert.strictEqual('New EEnum', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eClassifiers')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EEnum, descriptor.type);

            descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EAnnotation; });

            assert.ok(descriptor);
            assert.strictEqual('New EAnnotation', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eAnnotations')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EAnnotation, descriptor.type);

            descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EPackage; });

            assert.ok(descriptor);
            assert.strictEqual('New EPackage', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eSubPackages')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EPackage, descriptor.type);
        });

    });

    describe('#siblingTypes', function() {

        assert.ok(Edit.siblingTypes);
        assert.equal('function', typeof Edit.siblingTypes);

        it('should return the type EClass EDataType EAnnotation EPackage and EEnum from a EClass object', function() {
            var resource = createResource('model.json');
            var p = Ecore.EPackage.create({ name: 'p' });
            var c = Ecore.EClass.create({ name: 'c' });
            p.get('eClassifiers').add(c);
            resource.get('contents').add(p);

            var types = Edit.siblingTypes(c);

            assert.ok(types);
            assert.equal(5, types.length);

            var names = types.map(function(e) { return e.get('name'); });

            assert.equal(false, _.include(names, null));
            assert.ok(_.include(names, 'EClass'));
            assert.ok(_.include(names, 'EDataType'));
            assert.ok(_.include(names, 'EAnnotation'));
            assert.ok(_.include(names, 'EPackage'));
            assert.ok(_.include(names, 'EEnum'));
        });

    });

    describe('#siblingDescriptors', function() {
        assert.ok(Edit.siblingDescriptors);
        assert.equal('function', typeof Edit.siblingDescriptors);

        it('should return descriptors for each sibling types of a EClass object', function() {
            var resource = createResource('model.json');
            var p = Ecore.EPackage.create({ name: 'p' });
            var c = Ecore.EClass.create({ name: 'c' });
            p.get('eClassifiers').add(c);
            resource.get('contents').add(p);

            var descriptors = Edit.siblingDescriptors(c);

            assert.ok(descriptors);
            assert.equal(5, descriptors.length);

            var descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EClass; });

            assert.ok(descriptor);
            assert.strictEqual('New EClass', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eClassifiers')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EClass, descriptor.type);

            descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EDataType; });

            assert.ok(descriptor);
            assert.strictEqual('New EDataType', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eClassifiers')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EDataType, descriptor.type);

            descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EEnum; });

            assert.ok(descriptor);
            assert.strictEqual('New EEnum', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eClassifiers')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EEnum, descriptor.type);

            descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EAnnotation; });

            assert.ok(descriptor);
            assert.strictEqual('New EAnnotation', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eAnnotations')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EAnnotation, descriptor.type);

            descriptor = _.find(descriptors, function(e) { return e.type === Ecore.EPackage; });

            assert.ok(descriptor);
            assert.strictEqual('New EPackage', descriptor.label);
            assert.strictEqual(p, descriptor.owner);
            assert.strictEqual(p.get('eSubPackages')._feature, descriptor.feature);
            assert.strictEqual(Ecore.EPackage, descriptor.type);
        });

    });

    describe('#choiceOfValues', function() {
        assert.ok(Edit.choiceOfValues);
        assert.equal('function', typeof Edit.choiceOfValues);

        it('should return a correct list of choices', function() {
            var resource = createResource('model.json');
            var p = Ecore.EPackage.create({ name: 'p' });
            var c1 = Ecore.EClass.create({ name: 'c1' });
            var c2 = Ecore.EClass.create({ name: 'c2' });

            var r1 = Ecore.EReference.create({ name: 'r1' });
            c1.get('eStructuralFeatures').add(r1);

            p.get('eClassifiers')
            .add(c1)
            .add(c2);

            resource.get('contents').add(p);

            var choices = Edit.choiceOfValues(c1, c1.eClass.getEStructuralFeature('eSuperTypes'));

            assert.strictEqual(2, choices.length);
            assert.ok(_.contains(choices, c1));
            assert.ok(_.contains(choices, c2));

            choices = Edit.choiceOfValues(r1, r1.eClass.getEStructuralFeature('eType'));
            assert.strictEqual(2, choices.length);
            assert.ok(_.contains(choices, c1));
            assert.ok(_.contains(choices, c2));
        });

    });

});

