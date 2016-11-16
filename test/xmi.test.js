_ = require('underscore');
fs = require('fs');
var Ecore = require('../dist/ecore.xmi.js');
var assert = require("assert");


describe('#XMI', function() {

    describe('#parse', function() {

        it('should parse test1 correctly', function(done) {
            var resourceSet = Ecore.ResourceSet.create();
            var model = resourceSet.create({ uri: 'test1.xmi' });

            fs.readFile('./test/models/test1.xmi', 'utf8', function (err, data) {
                if (err) return console.log(err);

                model.load(data, function(model, err) {
                    assert.equal(err, null);

                    var contents = model.get('contents');
                    assert.equal(1, contents.size());

                    var root = contents.at(0);
                    assert.strictEqual(Ecore.EPackage, root.eClass);
                    assert.strictEqual('test', root.get('name'));
                    assert.strictEqual('test', root.get('nsPrefix'));
                    assert.strictEqual('http:///www.eclipselabs.org/test', root.get('nsURI'));

                    var eClassifiers = root.get('eClassifiers');
                    assert.equal(1, eClassifiers.size());

                    var rootClass = eClassifiers.at(0);
                    assert.strictEqual(Ecore.EClass, rootClass.eClass);
                    assert.strictEqual('Root', rootClass.get('name'));
                    assert.equal(1, rootClass.get('eStructuralFeatures').size());

                    var rootClassLabel = rootClass.get('eStructuralFeatures').at(0);
                    assert.strictEqual(Ecore.EAttribute, rootClassLabel.eClass);

                    assert.strictEqual(Ecore.EString, rootClassLabel.get('eType'));

                    done();
                }, { format: Ecore.XMI });
            });

        });

        it('should parse test2 correctly', function(done) {
            var resourceSet = Ecore.ResourceSet.create();
            var model = resourceSet.create({ uri: 'test2.xmi' });

            fs.readFile('./test/models/test2.xmi', 'utf8', function (err, data) {
                if (err) return console.log(err);

                model.load(data, function(model, err) {
                    assert.equal(err, null);

                    var contents = model.get('contents');
                    assert.equal(1, contents.size());

                    var root = contents.at(0);
                    assert.strictEqual(Ecore.EPackage, root.eClass);
                    assert.strictEqual('test', root.get('name'));
                    assert.strictEqual('test', root.get('nsPrefix'));
                    assert.strictEqual('http:///www.eclipselabs.org/test', root.get('nsURI'));

                    var eClassifiers = root.get('eClassifiers');
                    assert.equal(1, eClassifiers.size());

                    var rootClass = eClassifiers.at(0);
                    assert.strictEqual(Ecore.EClass, rootClass.eClass);
                    assert.strictEqual('Root', rootClass.get('name'));
                    assert.equal(2, rootClass.get('eStructuralFeatures').size());

                    var rootClassLabel = rootClass.get('eStructuralFeatures').at(0);
                    assert.strictEqual(Ecore.EAttribute, rootClassLabel.eClass);
                    assert.equal('label', rootClassLabel.get('name'));
                    assert.strictEqual(Ecore.EString, rootClassLabel.get('eType'));

                    var rootClassNumber = rootClass.get('eStructuralFeatures').at(1);
                    assert.strictEqual(Ecore.EAttribute, rootClassNumber.eClass);
                    assert.equal('number', rootClassNumber.get('name'));
                    assert.strictEqual(Ecore.EInt, rootClassNumber.get('eType'));

                    done();
                }, { format: Ecore.XMI });
            });
        });

        it('should parse test3 correctly', function(done) {
            var resourceSet = Ecore.ResourceSet.create();
            var model = resourceSet.create({ uri: 'test3.xmi' });

            fs.readFile('./test/models/test3.xmi', 'utf8', function (err, data) {
                if (err) return console.log(err);

                model.load(data, function(model, err) {
                    assert.equal(err, null);

                    var contents = model.get('contents');
                    assert.equal(1, contents.size());

                    var root = contents.at(0);
                    assert.strictEqual(Ecore.EPackage, root.eClass);
                    assert.strictEqual('test', root.get('name'));
                    assert.strictEqual('test', root.get('nsPrefix'));
                    assert.strictEqual('http:///www.eclipselabs.org/test', root.get('nsURI'));

                    var eClassifiers = root.get('eClassifiers');
                    assert.equal(1, eClassifiers.size());

                    var rootClass = eClassifiers.at(0);
                    assert.strictEqual(Ecore.EClass, rootClass.eClass);
                    assert.strictEqual('Root', rootClass.get('name'));
                    assert.equal(3, rootClass.get('eStructuralFeatures').size());
                    assert.equal(1, rootClass.get('eOperations').size());

                    var rootClassInteger = rootClass.get('eStructuralFeatures').at(0);
                    assert.strictEqual(Ecore.EAttribute, rootClassInteger.eClass);
                    assert.equal('integerObject', rootClassInteger.get('name'));
                    assert.strictEqual(Ecore.EIntegerObject, rootClassInteger.get('eType'));

                    var rootClassFloat = rootClass.get('eStructuralFeatures').at(1);
                    assert.strictEqual(Ecore.EAttribute, rootClassFloat.eClass);
                    assert.equal('floatObject', rootClassFloat.get('name'));
                    assert.strictEqual(Ecore.EFloatObject, rootClassFloat.get('eType'));

                    var rootClassLong = rootClass.get('eStructuralFeatures').at(2);
                    assert.strictEqual(Ecore.EAttribute, rootClassLong.eClass);
                    assert.equal('longObject', rootClassLong.get('name'));
                    assert.strictEqual(Ecore.ELongObject, rootClassLong.get('eType'));

                    var rootClassOperation = rootClass.get('eOperations').at(0);
                    assert.strictEqual(Ecore.EOperation, rootClassOperation.eClass);
                    assert.equal('validationOperation', rootClassOperation.get('name'));
                    assert.equal(2, rootClassOperation.get('eParameters').size());

                    var operationParameterDiagnostics = rootClassOperation.get('eParameters').at(0);
                    assert.strictEqual(Ecore.EParameter, operationParameterDiagnostics.eClass);
                    assert.equal('diagnostics', operationParameterDiagnostics.get('name'));
                    assert.strictEqual(Ecore.EDiagnosticChain, operationParameterDiagnostics.get('eType'));

                    var operationParameterContext = rootClassOperation.get('eParameters').at(1);
                    assert.strictEqual(Ecore.EParameter, operationParameterContext.eClass);
                    assert.equal('context', operationParameterContext.get('name'));

                    var operationParameterContextType = operationParameterContext.get('eGenericType');
                    assert.strictEqual(Ecore.EGenericType, operationParameterContextType.eClass);
                    assert.equal(2, operationParameterContextType.get('eTypeArguments').size());
                    assert.strictEqual(Ecore.EMap, operationParameterContextType.get('eClassifier'));

                    done();
                }, { format: Ecore.XMI });
            });
        });
    });

    describe('Containment feature with upper bound equal to 1:', function() {

      var resourceSet,
          resource,
          A,
          B;

      before(function() {

        resourceSet = Ecore.ResourceSet.create();
        
        var P = Ecore.EPackage.create({
          name: 'sample',
          nsPrefix: 'sample',
          nsURI: 'http://www.example.org/sample'
        });
        
        A = Ecore.EClass.create({name: 'A' });
        B = Ecore.EClass.create({ name: 'B' });

        var A_B = Ecore.EReference.create({
            name: 'b',
            upperBound: 1,
            containment: true,
            eType: function() { return B; }
        });
        
        A.get('eStructuralFeatures').add(A_B);

        P.get('eClassifiers')
            .add(A)
            .add(B);

        resource = resourceSet.create('model');
        resource.add(P);

      });

      it('should serialize test3 correctly', function() {

        var r = resourceSet.create({uri:'test3.xmi'}),
            a = A.create({}),
            b = B.create({});

        a.set('b', b);
        
        r.get('contents').add(a);

        var expected =  '<?xml version="1.0" encoding="UTF-8"?>' + 
          '\n' +
          '<sample:A xmi:version="2.0" xmlns:xmi="http://www.omg.org/XMI" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:sample="http://www.example.org/sample">' +
            '<b/>' +
          '</sample:A>';

        assert.strictEqual(r.to(Ecore.XMI), expected);
        
      });

      it('should unset correctly b1', function() {
        
        var r = resourceSet.create({uri:'test4.xmi'}),
            a = A.create({}),
            b1 = B.create({}),
            b2 = B.create({});
      
        a.set('b', b1);
        a.set('b', b2);
        
        assert.ok(b1.eContainer === undefined, 
          "eContainer of b1 should be undefined"
        );
        assert.ok(b1.eContainingFeature === undefined,
          "eContainingFeature of b1 should be undefined"
        );
      });

    });
    

});


