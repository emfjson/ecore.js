_ = require('../lib/underscore.js');
fs = require('fs');
var Ecore = require('../dist/ecore.js');
var assert = require("assert");

describe('Model', function() {

    describe('buildIndex', function() {

        it('should build correct index for EModelElements', function() {
            var m = new Ecore.Model('http://www.example.org/example');
            var p = Ecore.EcoreFactory.createEPackage({name: 'p'});
            var c1 = Ecore.EcoreFactory.createEClass({name: 'C1'});
            var c1_label = Ecore.EcoreFactory.createEAttribute({
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
    });

    describe('ModelRegistry', function() {

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

    describe('loading model from local filesystem', function() {

        it('should work', function(done) {

            var model = new Ecore.Model('simple.json');

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
    });

});