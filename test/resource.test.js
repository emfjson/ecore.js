var fs = require('fs');
var Ecore = require('../dist/ecore.js');
var assert = require('assert');

describe('Resource', function() {

    describe('buildIndex', function() {

        it('should build correct index for EModelElements', function() {
            var m = Ecore.Resource.create({ uri: 'http://www.example.org/example' });
            var p = Ecore.EPackage.create({name: 'p'});
            var c1 = Ecore.EClass.create({name: 'C1'});
            var c1_label = Ecore.EClass.create({
                name: 'label',
                eType: Ecore.EString
            });
            p.get('eClassifiers').add(c1);
            c1.get('eStructuralFeatures').add(c1_label);
            m.add(p);

            assert.strictEqual(m.getEObject('/'), p);
            assert.strictEqual(m.getEObject('//C1'), c1);
            assert.strictEqual(m.getEObject('//C1/label'), c1_label);
        });

        it('should build correct index for EModelElements with multiple roots', function() {
            var resourceSet = Ecore.ResourceSet.create();
            var r = resourceSet.create({ uri: 'test' });
            var p1 = Ecore.EPackage.create({ name: 'p1', nsPrefix: 'p1', nsURI: 'test/p1' });
            var c1 = Ecore.EClass.create({ name: 'C1' });
            var c1_label = Ecore.EClass.create({
                name: 'label',
                eType: Ecore.EString
            });
            c1.get('eStructuralFeatures').add(c1_label);
            p1.get('eClassifiers').add(c1);
            var p2 = Ecore.EPackage.create({ name: 'p2', nsPrefix: 'p2', nsURI: 'test/p2' });
            var c2 = Ecore.EClass.create({ name: 'C2' });
            p2.get('eClassifiers').add(c2);
            r.get('contents').add(p1).add(p2);

            assert.strictEqual(r.getEObject('/0'), p1);
            assert.strictEqual(r.getEObject('/1'), p2);
            assert.strictEqual(r.getEObject('/0/C1'), c1);
            assert.strictEqual(r.getEObject('/0/C1/label'), c1_label);
            assert.strictEqual(r.getEObject('/1/C2'), c2);
        });

        describe('index for instance models', function() {
            var testModel = Ecore.Resource.create({ uri: 'test.json' });
            var testPackage = Ecore.EPackage.create({
                name: 'test',
                nsURI: 'http://www.example.org/test',
                nsPrefix: 'test'
            });
            testModel.add(testPackage);
            var Container = Ecore.EClass.create({ name: 'Container' });
            testPackage.get('eClassifiers').add(Container);
            var Container_child = Ecore.EReference.create({
                name: 'child',
                upperBound: -1,
                containment: true
            });

            Container.get('eStructuralFeatures').add(Container_child);
            var Child = Ecore.EClass.create({ name: 'Child' });
            testPackage.get('eClassifiers').add(Child);
            var Child_manyRefs = Ecore.EReference.create({
                name: 'manyRefs',
                upperBound: -1
            });
            Child.get('eStructuralFeatures').add(Child_manyRefs);

            it('should be correct', function() {
                var m = Ecore.Resource.create({ uri: 'instance.json' });
                var contain = Ecore.create(Container);
                var c1 = Ecore.create(Child);
                var c2 = Ecore.create(Child);
                contain.get('child').add(c1);
                contain.get('child').add(c2);
                m.add(contain);

                assert.ok(contain);
                assert.equal(2, contain.get('child').size());

                assert.strictEqual(contain, m.getEObject('/'));
                assert.strictEqual(c1, m.getEObject('//@child.0'));
                assert.strictEqual(c2, m.getEObject('//@child.1'));
            });

            it('should be correct if multiple roots', function() {
                var m = Ecore.Resource.create({ uri: 'instance.json' });
                var c1 = Ecore.create(Child);
                var c2 = Ecore.create(Child);
                m.add(c1).add(c2);

                assert.equal(2, m.get('contents').size());
                assert.strictEqual(c1, m.getEObject('/0'));
                assert.strictEqual(c2, m.getEObject('/1'));
            });

        });

    });

    describe('Registry', function() {

        it('should contain ecore model', function() {
            assert.ok(Ecore.EPackage.Registry);
            assert.ok(Ecore.EPackage.Registry._ePackages);

            assert.ok(Ecore.EPackage.Registry._ePackages['http://www.eclipse.org/emf/2002/Ecore']);
        });

    });

    describe('#load', function() {

        it('should read model made of single object', function(done) {
            var model = { eClass: "http://www.eclipse.org/emf/2002/Ecore#//EPackage", name: "foo"};

            Ecore.Resource.create({ uri: 'simple.json' }).load(model, function(result, err) {
                assert.ok(result);
                assert.equal(err, null);

                assert.equal(1, result.get('contents').size());

                var root = result.get('contents').at(0);
                assert.ok(root);
                assert.equal('EPackage', root.eClass.get('name'));
                assert.equal('foo', root.get('name'));

                done();
            });
        });

        it('should read model made of array of objects', function(done) {
            var model = [
                { eClass: "http://www.eclipse.org/emf/2002/Ecore#//EPackage", name: "foo"},
                { eClass: "http://www.eclipse.org/emf/2002/Ecore#//EPackage", name: "bar"},
                { eClass: "http://www.eclipse.org/emf/2002/Ecore#//EPackage", name: "acme"}
            ];

            Ecore.Resource.create({ uri: 'simple.json' }).load(model, function(result, err) {
                assert.ok(result);
                assert.equal(err, null);
                assert.equal(3, result.get('contents').size());

                var r1 = result.get('contents').at(0);
                assert.ok(r1);
                assert.equal('EPackage', r1.eClass.get('name'));
                assert.equal('foo', r1.get('name'));

                var r2 = result.get('contents').at(1);
                assert.ok(r2);
                assert.equal('EPackage', r2.eClass.get('name'));
                assert.equal('bar', r2.get('name'));

                var r3 = result.get('contents').at(2);
                assert.ok(r3);
                assert.equal('EPackage', r3.eClass.get('name'));
                assert.equal('acme', r3.get('name'));

                done();
            });
        });

        it('should write model made of more than one root element into an array', function(done) {
            var model = [
                { eClass: "http://www.eclipse.org/emf/2002/Ecore#//EPackage", name: "foo"},
                { eClass: "http://www.eclipse.org/emf/2002/Ecore#//EPackage", name: "bar"},
                { eClass: "http://www.eclipse.org/emf/2002/Ecore#//EPackage", name: "acme"}
            ];

            var rs = Ecore.ResourceSet.create();
            rs.create({ uri: 'simple.json' }).load(model, function(resource, err) {
                assert.equal(err, null);
                assert.equal(3, resource.get('contents').size());
                var json = resource.to();
                assert.ok(json);
                assert.ok(_.isArray(json));
                assert.equal(3, json.length);
                done();
            });
       });
    });

    describe('load model from filesystem', function() {

        it('should build the model', function(done) {

            var model = Ecore.Resource.create({ uri: 'simple.json' });

            fs.readFile('./test/models/simple.json', 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }

                model.load(data, function(model, err) {
                    var contents = model.get('contents').array();
                    assert.ok(contents);
                    assert.equal(contents.length, 1);

                    var root = contents[0];
                    assert.strictEqual(root.eClass, Ecore.EPackage);
                    assert.strictEqual(root.get('name'), 'example');
                    assert.strictEqual(root.get('nsPrefix'), 'example');
                    assert.strictEqual(root.get('nsURI'), 'http://www.example.org/example');

                    assert.equal(root.get('eClassifiers').size(), 2);

                    var eClassA = root.get('eClassifiers').at(0);
                    assert.ok(eClassA);
                    assert.strictEqual(eClassA.eClass, Ecore.EClass);
                    assert.strictEqual(eClassA.get('name'), 'A');

                    assert.equal(eClassA.get('eStructuralFeatures').size(), 1);

                    var eClassA_name = eClassA.get('eStructuralFeatures').at(0);
                    assert.ok(eClassA_name);
                    assert.strictEqual(eClassA_name.eClass, Ecore.EAttribute);
                    assert.strictEqual(eClassA_name.get('name'), 'name');
                    assert.strictEqual(eClassA_name.get('eType'), Ecore.EString);

                    var eClassB = root.get('eClassifiers').at(1);
                    assert.ok(eClassB);
                    assert.strictEqual(eClassB.eClass, Ecore.EClass);
                    assert.strictEqual(eClassB.get('name'), 'B');

                    assert.equal(eClassB.get('eSuperTypes').size(), 1);
                    assert.strictEqual(eClassB.get('eSuperTypes').at(0), eClassA);

                    done();
                });
            });

        });

    }); // end load

    describe('toJSON', function() {

        it('should produce a valid JSON', function(done) {
            var model = Ecore.Resource.create({ uri: 'simple.json' });

            fs.readFile('./test/models/simple.json', 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }

                model.load(data, function(model, err) {

                    var json = model.to(Ecore.JSON);

                    assert.ok(json);
                    assert.strictEqual(json.eClass, 'http://www.eclipse.org/emf/2002/Ecore#//EPackage');
                    assert.strictEqual(json.name, 'example');
                    assert.strictEqual(json.nsURI, 'http://www.example.org/example');
                    assert.strictEqual(json.nsPrefix, 'example');

                    assert.equal(json.eClassifiers.length, 2);

                    var first = json.eClassifiers[0];
                    assert.equal(first.eClass, 'http://www.eclipse.org/emf/2002/Ecore#//EClass');
                    assert.equal(first.name, 'A');
                    assert.equal(first.eStructuralFeatures.length, 1);

                    var first_features = first.eStructuralFeatures[0];
                    assert.equal(first_features.eClass,'http://www.eclipse.org/emf/2002/Ecore#//EAttribute');
                    assert.equal(first_features.name, 'name');
                    assert.equal(first_features.eType.$ref, 'http://www.eclipse.org/emf/2002/Ecore#//EString');
                    assert.equal(first_features.eType.eClass, 'http://www.eclipse.org/emf/2002/Ecore#//EDataType');

                    var second = json.eClassifiers[1];
                    assert.equal(second.eClass, 'http://www.eclipse.org/emf/2002/Ecore#//EClass');
                    assert.equal(second.name, 'B');
                    assert.equal(second.eSuperTypes.length, 1);
                    assert.equal(second.eSuperTypes[0].$ref, '//A');
                    assert.equal(second.eSuperTypes[0].eClass, 'http://www.eclipse.org/emf/2002/Ecore#//EClass');
                    assert.equal(second.eStructuralFeatures, undefined);

                    done();
                });
            });
        });
    }); // end toJSON

});
