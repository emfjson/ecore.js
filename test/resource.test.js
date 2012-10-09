fs = require('fs');
var Ecore = require('../dist/ecore.js');
var assert = require("assert");

describe('Model', function() {

    describe('buildIndex', function() {

        it('should build correct index for EModelElements', function() {
            var m = new Ecore.Resource('http://www.example.org/example');
            var p = Ecore.createEPackage({name: 'p'});
            var c1 = Ecore.createEClass({name: 'C1'});
            var c1_label = Ecore.createEAttribute({
                name: 'label',
                eType: Ecore.EcorePackage.EString
            });
            p.get('eClassifiers').add(c1);
            c1.get('eStructuralFeatures').add(c1_label);
            m.add(p);

            assert.strictEqual(m.getEObject('/'), p);
            assert.strictEqual(m.getEObject('//C1'), c1);
            assert.strictEqual(m.getEObject('//C1/label'), c1_label);
        });

        describe('index for instance models', function() {
                var testModel = new Ecore.Resource('test.json');
                var testPackage = Ecore.createEPackage({name: 'test',
                    nsURI: 'http://www.example.org/test', nsPrefix: 'test'});
                testModel.add(testPackage);
                var Container = Ecore.createEClass({name: 'Container'});
                testPackage.get('eClassifiers').add(Container);
                var Container_child = Ecore.createEReference({
                    name: 'child',
                    upperBound: -1,
                    isContainment: true
                });
                Container.get('eStructuralFeatures').add(Container_child);
                var Child = Ecore.createEClass({name: 'Child'});
                testPackage.get('eClassifiers').add(Child);
                Child_manyRefs = Ecore.createEReference({
                    name: 'manyRefs',
                    upperBound: -1
                });
                Child.get('eStructuralFeatures').add(Child_manyRefs);

            it('should be correct', function() {
                var m = new Ecore.Resource('instance.json');
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

        });

    });

    describe('Registry', function() {

        it('should contain ecore model', function() {
            assert.ok(Ecore.Registry);
            assert.ok(Ecore.Registry.models);

            assert.ok(Ecore.Registry.models['http://www.eclipse.org/emf/2002/Ecore']);
        });

        describe('#getEObject', function() {
           it('should return EcorePackage as root', function() {
              var ecorePackage = Ecore.Registry.getEObject('http://www.eclipse.org/emf/2002/Ecore#/');

              assert.strictEqual(ecorePackage, Ecore.EcorePackage);
           });

           it('should return EClass as #//EClass', function() {
              var eClass = Ecore.Registry.getEObject('http://www.eclipse.org/emf/2002/Ecore#//EClass');

              assert.strictEqual(eClass, Ecore.EcorePackage.EClass);
            });

            it('should return EClass.name as #//EClass/name', function() {
                var eClass_name = Ecore.Registry.getEObject('http://www.eclipse.org/emf/2002/Ecore#//EClass/name');

                assert.strictEqual(eClass_name, Ecore.EcorePackage.EClass_name);
            });
        });

    });

    describe('load model from filesystem', function() {

        it('should build the model', function(done) {

            var model = new Ecore.Resource('simple.json');

            fs.readFile('./test/simple.json', 'utf8', function (err,data) {
                if (err) {
                    return console.log(err);
                }

                model.load(function(model) {
                    var contents = model.contents;
                    assert.ok(contents);
                    assert.equal(contents.length, 1);

                    var root = contents[0];
                    assert.strictEqual(root.eClass, Ecore.EcorePackage.EPackage);
                    assert.strictEqual(root.get('name'), 'example');
                    assert.strictEqual(root.get('nsPrefix'), 'example');
                    assert.strictEqual(root.get('nsURI'), 'http://www.example.org/example');

                    assert.equal(root.get('eClassifiers').size(), 1);

                    var eClass = root.get('eClassifiers').at(0);
                    assert.ok(eClass);
                    assert.strictEqual(eClass.eClass, Ecore.EcorePackage.EClass);
                    assert.strictEqual(eClass.get('name'), 'EClass');

                    assert.equal(eClass.get('eStructuralFeatures').size(), 1);

                    var eClass_name = eClass.get('eStructuralFeatures').at(0);
                    assert.ok(eClass_name);
                    assert.strictEqual(eClass_name.eClass, Ecore.EcorePackage.EAttribute);
                    assert.strictEqual(eClass_name.get('name'), 'name');

                    done();
                }, function(){}, JSON.parse(data));
            });

        });

    }); // end load

    describe('toJSON', function() {
        var model = new Ecore.Resource('simple.json');

        fs.readFile('./test/simple.json', 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }

            model.load(function(model) {

                var json = model.toJSON();


            }, function(){}, JSON.parse(data));
        });
    }); // end toJSON

});
